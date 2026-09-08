import { buildGoHarness, parseRunnerResponse } from './go-source.mjs';

export type ResultRow = { name: string; pass: boolean; detail?: string; actual?: string; expected?: string };
export type RuntimeResult = { rows: ResultRow[]; logs: string[]; error?: string };

const timeoutMs = 10000;

export async function runCode(code: string, lesson: { tests?: Array<{ name: string; expression: string; expected?: unknown }>; testImports?: string[] } | null, signal: AbortSignal): Promise<RuntimeResult> {
  if (signal.aborted) return { rows: [], logs: [], error: '已取消執行。' };
  const configuredUrl = import.meta.env.VITE_GO_RUNNER_URL as string | undefined;
  const url = configuredUrl || (import.meta.env.DEV ? '/go-compile' : undefined);
  if (!url) return { rows: [], logs: [], error: '尚未設定 Go 執行服務（VITE_GO_RUNNER_URL）。' };
  let source: string;
  try { source = buildGoHarness(code, lesson); } catch (error) { return { rows: [], logs: [], error: String(error instanceof Error ? error.message : error) }; }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const cancel = () => controller.abort();
  signal.addEventListener('abort', cancel, { once: true });
  try {
    const form = new URLSearchParams({ body: source, version: '2' });
    const response = await fetch(url, configuredUrl
      ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: source }), signal: controller.signal }
      : { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form, signal: controller.signal });
    const text = await response.text();
    let payload: unknown;
    try { payload = JSON.parse(text); } catch { return { rows: [], logs: [], error: `執行服務回傳非 JSON（HTTP ${response.status}）。` }; }
    const result = parseRunnerResponse(payload);
    if (!result.error && lesson?.tests) {
      const expectedNames = lesson.tests.map((test) => test.name);
      const actualNames = result.rows.map((row) => row.name);
      if (result.rows.length !== expectedNames.length || actualNames.some((name, index) => name !== expectedNames[index])) result.error = `執行服務未回傳完整測試結果（${result.rows.length}/${expectedNames.length}）。`;
    }
    if (!response.ok && !result.error) result.error = `執行服務錯誤（HTTP ${response.status}）。`;
    return result;
  } catch (error) {
    if (signal.aborted) return { rows: [], logs: [], error: '已取消執行。' };
    if (error instanceof DOMException && error.name === 'AbortError') return { rows: [], logs: [], error: '執行超過 10 秒，已停止。' };
    return { rows: [], logs: [], error: `無法連線到 Go 執行服務：${error instanceof Error ? error.message : String(error)}` };
  } finally { clearTimeout(timer); signal.removeEventListener('abort', cancel); }
}
