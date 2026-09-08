#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { lessons } from '../curriculum/lessons.mjs';
import { buildGoHarness, parseRunnerResponse } from '../lib/go-source.mjs';

const ENDPOINT = 'https://go.dev/_/compile';
const CONCURRENCY = 2;
const TIMEOUT_MS = 12000;
const reportPath = new URL('../docs/curriculum-audit.json', import.meta.url);

function usage() {
  console.error('Usage: node scripts/verify-curriculum.mjs [--solutions|--starters|--all]');
}

async function compile(code) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const body = new URLSearchParams({ body: code, version: '2' });
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: controller.signal,
    });
    const text = await response.text();
    let payload;
    try { payload = JSON.parse(text); } catch { return { rows: [], logs: [], error: `HTTP ${response.status}: non-JSON response` }; }
    const result = parseRunnerResponse(payload);
    if (!response.ok && !result.error) result.error = `HTTP ${response.status}`;
    return result;
  } catch (error) {
    return { rows: [], logs: [], error: error?.name === 'AbortError' ? `timeout after ${TIMEOUT_MS}ms` : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, worker) {
  const output = Array(items.length);
  let next = 0;
  async function consume() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      output[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, consume));
  return output;
}

function checkResult(lesson, result, expectAllPass) {
  const expectedNames = lesson.tests.map((test) => test.name);
  const names = result.rows.map((row) => row.name);
  const failures = [];
  const compileError = result.error && /(?:\.\/)?prog\.go:\d+:|# command-line-arguments|syntax error|undefined:/.test(result.error);
  if (result.error && !(compileError && !expectAllPass)) failures.push(result.error);
  if (!(compileError && !expectAllPass) && (names.length !== expectedNames.length || names.some((name, i) => name !== expectedNames[i]))) {
    failures.push(`rows ${names.length}/${expectedNames.length} or names/order mismatch`);
  }
  const failedRows = result.rows.filter((row) => !row.pass).map((row) => `${row.name}${row.detail ? `: ${row.detail}` : ''}`);
  if (expectAllPass && failedRows.length) failures.push(...failedRows.map((row) => `failed: ${row}`));
  if (!expectAllPass && result.rows.length === expectedNames.length && result.rows.length > 0 && result.rows.every((row) => row.pass)) {
    failures.push('starter passes all tests');
  }
  return { pass: failures.length === 0, failures, rows: result.rows, logs: result.logs, ...(compileError && !expectAllPass ? { expectedFailure: 'compile-error' } : {}) };
}

async function main() {
  const mode = process.argv[2] || '--all';
  if (!['--solutions', '--starters', '--all'].includes(mode)) { usage(); process.exitCode = 2; return; }
  const jobs = mode === '--all' ? lessons.flatMap((lesson) => [
    { lesson, kind: 'solution', code: lesson.solution, expectAllPass: true },
    { lesson, kind: 'starter', code: lesson.starter, expectAllPass: false },
  ]) : lessons.map((lesson) => {
    const kind = mode.slice(2, -1);
    return { lesson, kind, code: lesson[kind], expectAllPass: mode === '--solutions' };
  });
  const results = await mapLimit(jobs, CONCURRENCY, async ({ lesson, kind, code, expectAllPass }) => {
    let checked;
    try { checked = checkResult(lesson, await compile(buildGoHarness(code, lesson)), expectAllPass); }
    catch (error) { checked = { pass: false, failures: [String(error)], rows: [], logs: [] }; }
    if (!checked.pass) console.error(`${kind} ${lesson.id} ${lesson.title}: ${checked.failures.join('; ')}`);
    return { id: lesson.id, title: lesson.title, kind, ...checked };
  });
  const [curriculumSource, harnessSource] = await Promise.all([
    readFile(new URL('../curriculum/lessons.mjs', import.meta.url)),
    readFile(new URL('../lib/go-source.mjs', import.meta.url)),
  ]);
  const sha256 = (source) => createHash('sha256').update(source).digest('hex');
  const report = {
    timestamp: new Date().toISOString(), endpoint: ENDPOINT, concurrency: CONCURRENCY,
    timeoutMs: TIMEOUT_MS, mode, lessonCount: lessons.length,
    sources: { curriculumSha256: sha256(curriculumSource), harnessSha256: sha256(harnessSource) },
    results, summary: { total: results.length, passed: results.filter((x) => x.pass).length, failed: results.filter((x) => !x.pass).length },
  };
  await mkdir(new URL('../docs/', import.meta.url), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`${report.summary.passed}/${report.summary.total} ${mode.slice(2)} checks passed; report: docs/curriculum-audit.json`);
  if (report.summary.failed) process.exitCode = 1;
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
