import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGoHarness, parseRunnerResponse } from '../lib/go-source.mjs';
import worker from '../worker/index.js';

test('buildGoHarness adds isolated aliases and framed probes', () => {
  const source = buildGoHarness('package main\n\nfunc add(a, b int) int { return a + b }', {
    tests: [{ name: '加法', expression: 'add(2, 3)', expected: 5 }],
  });
  assert.match(source, /labfmt "fmt"/);
  assert.match(source, /labjson "encoding\/json"/);
  assert.match(source, /GO_LAB_RESULT/);
  assert.match(source, /actual := \(add\(2, 3\)\)/);
  assert.equal((source.match(/func main\s*\(/g) || []).length, 1);
});

test('parseRunnerResponse separates framed rows and user logs', () => {
  const payload = { output: 'hello\nGO_LAB_RESULT eyJuYW1lIjoiVCIsInBhc3MiOnRydWUsImFjdHVhbCI6NSwiZXhwZWN0ZWQiOiI1In0=\n' };
  const result = parseRunnerResponse(payload);
  assert.deepEqual(result.logs, ['hello']);
  assert.equal(result.rows[0].name, 'T');
  assert.equal(result.rows[0].pass, true);
  assert.equal(result.rows[0].actual, '5');
});

test('parseRunnerResponse reports compile errors and malformed frames', () => {
  const result = parseRunnerResponse({ compile_errors: 'syntax error', output: 'GO_LAB_RESULT nope\n' });
  assert.equal(result.error, 'syntax error');
  assert.deepEqual(result.logs, ['GO_LAB_RESULT nope']);
  assert.deepEqual(result.rows, []);
});

test('parseRunnerResponse accepts the official Events response shape', () => {
  const result = parseRunnerResponse({ Events: [{ Message: 'log\n', Kind: 'stdout' }, { Message: 'bad', Kind: 'stderr' }], Status: 0 });
  assert.deepEqual(result.logs, ['log', 'bad']);
  assert.equal(result.error, undefined);
});

test('harness rejects a learner supplied main', () => {
  assert.throws(() => buildGoHarness('package main\nfunc main() {}', { tests: [] }), /不需要自行撰寫/);
});

test('playground code is passed through unchanged', () => {
  const code = 'package main\nfunc main() {}';
  assert.equal(buildGoHarness(code, null), code);
});

test('malformed empty service payload is rejected', () => {
  assert.equal(parseRunnerResponse({}).error, '執行服務回傳格式錯誤。');
});

test('lesson test imports are added only when absent from learner source', () => {
  const source = buildGoHarness('package main\n\nfunc size() int { return 1 }', { testImports: ['strings'], tests: [{ name: 'reader', expression: 'strings.NewReader("x").Len()', expected: 1 }] });
  assert.match(source, /"strings"/);
  const existing = buildGoHarness('package main\nimport "strings"\n\nfunc size() int { return 1 }', { testImports: ['strings'], tests: [{ name: 'reader', expression: 'strings.NewReader("x").Len()', expected: 1 }] });
  assert.equal((existing.match(/"strings"/g) || []).length, 1);
});

test('worker enforces POST and forwards only code to the fixed upstream', async () => {
  const originalFetch = globalThis.fetch;
  let forwarded;
  globalThis.fetch = async (request, options) => {
    forwarded = { request: request instanceof Request ? request.url : String(request), options };
    return new Response(JSON.stringify({ Errors: '', Events: [] }), { headers: { 'content-type': 'application/json' } });
  };
  try {
    const response = await worker.fetch(new Request('https://runner.test', { method: 'POST', headers: { Origin: 'https://frobel0520.github.io', 'Content-Type': 'application/json' }, body: JSON.stringify({ code: 'package main' }) }), { ALLOWED_ORIGIN: 'https://frobel0520.github.io' });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://frobel0520.github.io');
    assert.equal(forwarded.request, 'https://go.dev/_/compile');
    assert.equal((await forwarded.options.body).get('body'), 'package main');
  } finally { globalThis.fetch = originalFetch; }
});

test('worker rejects oversized bodies and non POST requests', async () => {
  const env = { ALLOWED_ORIGIN: 'https://frobel0520.github.io' };
  assert.equal((await worker.fetch(new Request('https://runner.test'), env)).status, 405);
  const huge = JSON.stringify({ code: 'x'.repeat(128 * 1024) });
  assert.equal((await worker.fetch(new Request('https://runner.test', { method: 'POST', body: huge }), env)).status, 413);
});
