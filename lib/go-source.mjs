const FRAME = 'GO_LAB_RESULT ';

/** @typedef {{ tests?: Array<{ name: string, expression: string, expected?: unknown }>, testImports?: string[] }} GoLesson */

/** Build a complete package main for the official Go playground compile API. */
/** @param {string} code @param {GoLesson|null} [lesson=null] @returns {string} */
export function buildGoHarness(code, lesson = null) {
  if (typeof code !== 'string' || !/^\s*package\s+main\b/m.test(code)) {
    throw new Error('程式必須以 package main 開頭。');
  }
  if (lesson === null) return code;
  if (/\bfunc\s+main\s*\(/.test(code)) {
    throw new Error('練習程式不需要自行撰寫 main 函式。');
  }
  const tests = lesson?.tests ?? [];
  const packageMatch = /^\s*package\s+main\b[^\n]*(?:\n|$)/m.exec(code);
  const insertAt = packageMatch ? packageMatch.index + packageMatch[0].length : 0;
  const existingImports = new Set([...code.matchAll(/(?:^|[\s(])(?:[A-Za-z_]\w*\s+)?"([^"\n]+)"/g)].map((match) => match[1]));
  const testImports = (lesson.testImports ?? []).filter((path) => typeof path === 'string' && path && !existingImports.has(path));
  const imports = `import (\n\tlabbase64 "encoding/base64"\n\tlabfmt "fmt"\n\tlabjson "encoding/json"\n${testImports.map((path) => `\t"${path.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`).join('\n')}\n)\n`;
  const probes = tests.map((test, index) => {
    const name = JSON.stringify(String(test.name ?? `測試 ${index + 1}`));
    const expression = String(test.expression ?? '').trim();
    if (!expression) throw new Error(`測試 ${index + 1} 缺少 expression。`);
    const expected = JSON.stringify(test.expected === undefined ? null : test.expected);
    return `labRun(${name}, func() (any, string) { actual := (${expression}); return actual, ${JSON.stringify(expected)} })`;
  }).join('\n');
  const suffix = `
func labEmit(name string, actual any, expected string, detail string) {
	payload := map[string]any{"name": name}
	if detail != "" { payload["pass"] = false; payload["detail"] = detail } else {
		actualJSON, err := labjson.Marshal(actual)
		if err != nil { payload["pass"] = false; payload["detail"] = err.Error() } else {
			var value any
			if err := labjson.Unmarshal(actualJSON, &value); err != nil { payload["pass"] = false; payload["detail"] = err.Error() } else { payload["pass"] = true; payload["actual"] = value; payload["expected"] = expected }
		}
	}
	data, _ := labjson.Marshal(payload)
	labfmt.Println("${FRAME}" + labbase64.StdEncoding.EncodeToString(data))
}

func labRun(name string, probe func() (any, string)) {
	defer func() { if recovered := recover(); recovered != nil { labEmit(name, nil, "", labfmt.Sprint(recovered)) } }()
	actual, expected := probe()
	labEmit(name, actual, expected, "")
}

func main() {
${probes || '\t// No lesson tests: compile and run the learner program.'}
}
`;
  return code.slice(0, insertAt) + imports + code.slice(insertAt) + suffix;
}

export function parseRunnerResponse(payload) {
  if (!payload || typeof payload !== 'object') return { rows: [], logs: [], error: '執行服務回傳格式錯誤。' };
  if (!('output' in payload) && !('Output' in payload) && !('Events' in payload) && !('Errors' in payload) && !('errors' in payload) && !('compile_errors' in payload) && !('Status' in payload) && !('status' in payload)) return { rows: [], logs: [], error: '執行服務回傳格式錯誤。' };
  const errors = payload.compile_errors || payload.Errors || payload.errors;
  const output = payload.output ?? payload.Output ?? (Array.isArray(payload.Events)
    ? payload.Events.map((event) => event?.Message ?? event?.message ?? '').join('')
    : '');
  const rows = [];
  const logs = [];
  for (const line of String(output).split(/\r?\n/)) {
    if (!line) continue;
    if (!line.startsWith(FRAME)) { logs.push(line); continue; }
    try {
      const row = JSON.parse(new TextDecoder().decode(decodeBase64(line.slice(FRAME.length))));
      if (!row || typeof row.name !== 'string' || typeof row.pass !== 'boolean') throw new Error('invalid row');
      if (row.detail) rows.push(row);
      else rows.push({ ...row, actual: JSON.stringify(row.actual), expected: String(row.expected), pass: deepEqual(row.actual, JSON.parse(row.expected)) });
    } catch { logs.push(line); }
  }
  const status = payload.Status ?? payload.status;
  const error = errors ? String(errors) : (status !== undefined && Number(status) !== 0 ? `執行服務狀態：${status}` : undefined);
  return error ? { rows, logs, error } : { rows, logs };
}

function decodeBase64(value) {
  if (typeof atob === 'function') {
    const binary = atob(value);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }
  return Uint8Array.from(Buffer.from(value, 'base64'));
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, i) => deepEqual(value, b[i]));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ak = Object.keys(a).sort();
    const bk = Object.keys(b).sort();
    return ak.length === bk.length && ak.every((key, i) => key === bk[i] && deepEqual(a[key], b[key]));
  }
  return false;
}

export { FRAME };
