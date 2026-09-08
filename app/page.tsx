'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Play,
  ArrowUpRight,
  Code2,
  BookOpen,
  Check,
  Terminal,
  ChevronRight,
  RotateCcw,
  Lightbulb,
  CircleCheck,
  CircleX,
  ArrowRight,
  Square,
} from 'lucide-react';
import CodeEditor from '@/components/code-editor';
import { chapters, lessons, modules } from '@/curriculum/lessons.mjs';
import { runCode, type ResultRow } from '@/lib/run-code';
import { parseProgress, STORAGE_KEY, type ProgressState } from '@/lib/storage';
const ids = lessons.map((l) => l.id);
const initial = parseProgress(null, ids);
const playgroundCode = 'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello, Go!")\n}';
function Lab() {
  const [saved, setSaved] = useState<ProgressState>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [hint, setHint] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [rows, setRows] = useState<ResultRow[]>([]);
  const diagnostics: {file:string;line:number;column:number;code:number;message:string}[] = [];
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resultState, setResultState] = useState('等待執行');
  const [resultTab, setResultTab] = useState('checks');
  const [lastCode, setLastCode] = useState<string | null>(null);
  const sequence = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const { setOpenMobile } = useSidebar();
  const selected = saved.selected;
  const playground = selected === 'playground';
  const lesson = lessons.find((l) => l.id === selected) || lessons[0];
  const chapter = chapters[lesson.chapterIndex];
  const code =
    saved.drafts[selected] ?? (playground ? playgroundCode : lesson.starter);
  const completed = new Set(saved.completed);
  const stale = lastCode !== null && lastCode !== code;
  // Hydrate and report browser storage state after SSR; this effect synchronizes an external system.
  /* eslint-disable react/react-compiler -- These effects synchronize browser storage after SSR. */
  useEffect(() => {
    try {
      setSaved(parseProgress(localStorage.getItem(STORAGE_KEY), ids));
    } catch {
      setStorageError(true);
    }
    setHydrated(true);
    return () => {
      abort.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [saved, hydrated]);
  /* eslint-enable react/react-compiler */
  const cancel = useCallback(() => {
    sequence.current++;
    abort.current?.abort();
    setBusy(false);
  }, []);
  function navigate(id: string) {
    cancel();
    setSaved((s) => ({ ...s, selected: id }));
    setHint(0);
    setShowSolution(false);
    setResetConfirm(false);
    setRows([]);
    setLogs([]);
    setError('');
    setLastCode(null);
    setResultState('等待執行');
    setOpenMobile(false);
  }
  function edit(value: string) {
    setSaved((s) => ({ ...s, drafts: { ...s.drafts, [selected]: value } }));
  }
  async function run() {
    if (busy || !hydrated) return;
    const request = ++sequence.current;
    const snapshot = code;
    const currentId = selected;
    setBusy(true);
    setError('');
    setRows([]);
    setLogs([]);
    setLastCode(snapshot);
    setResultState('編譯檢查中…');
    setResultTab('checks');
    try {
      if (code.length > 100000)
        throw new Error('程式碼超過 100,000 字元，請縮短後再試。');
      abort.current = new AbortController();
      const runtime = await runCode(snapshot, playground ? null : lesson, abort.current.signal);
      if (request !== sequence.current) return;
      setLogs(runtime.logs);
      const allRows = runtime.rows;
      setRows(allRows);
      if (runtime.error) throw new Error(runtime.error);
      const pass = allRows.length > 0 && allRows.every((r) => r.pass);
      setResultState(
        playground
          ? '執行完成'
          : pass
            ? '全部通過，練習完成'
            : '還有幾個地方需要調整',
      );
      if (playground) setResultTab('console');
      if (pass && !playground)
        setSaved((s) => ({
          ...s,
          completed: [...new Set([...s.completed, currentId])],
        }));
    } catch (e) {
      if (request === sequence.current) {
        setError(e instanceof Error ? e.message : String(e));
        setResultState('執行未完成');
      }
    } finally {
      if (request === sequence.current) setBusy(false);
    }
  }
  return (
    <>
      <a className="skip-link" href="#lesson">
        跳至練習內容
      </a>
      <Sidebar>
        <SidebarHeader>
          <a className="brand" href={import.meta.env.BASE_URL} aria-label="Go Lab 首頁">
            <span className="ts-logo">go</span>Go
            <span className="brand-light"> / lab</span>
          </a>
        </SidebarHeader>
        <SidebarContent>
          <div className="nav-label">
            學習路徑 <span>10 CHAPTERS</span>
          </div>
          <nav aria-label="課程章節">
            {chapters.map((c, i) => {
              const done = c.lessons.filter((l) => completed.has(l.id)).length;
              return (
                <button
                  className={
                    'chapter ' +
                    (!playground && i === lesson.chapterIndex ? 'selected' : '')
                  }
                  key={c.title}
                  aria-current={
                    !playground && i === lesson.chapterIndex
                      ? 'page'
                      : undefined
                  }
                  onClick={() =>
                    navigate(
                      c.lessons.find((l) => !completed.has(l.id))?.id ||
                        c.lessons[0].id,
                    )
                  }
                >
                  <span className="chapter-number">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{c.title}</span>
                  {done === 4 ? (
                    <CircleCheck size={15} />
                  ) : (
                    <small>{done}/4</small>
                  )}
                </button>
              );
            })}
          </nav>
        </SidebarContent>
        <SidebarFooter>
          <div className="progress-label">
            你的學習進度{' '}
            <span>
              {completed.size} / {lessons.length}
            </span>
          </div>
          <Progress
            aria-label="課程完成進度"
            value={(completed.size / lessons.length) * 100}
          />
          <button
            className={'playground ' + (playground ? 'selected' : '')}
            onClick={() => navigate('playground')}
          >
            <Code2 size={17} />
            自由練習區 <ArrowUpRight size={15} />
          </button>
          <p className="sidebar-note">專為有程式經驗的你設計</p>
        </SidebarFooter>
      </Sidebar>
      <main className="workspace" id="lesson">
        <header className="topbar">
          <div>
            <SidebarTrigger />
            <span>語法實戰</span>
            <ChevronRight size={14} />
            <span>
              {playground
                ? 'PLAYGROUND'
                : `CHAPTER ${String(lesson.chapterIndex + 1).padStart(2, '0')}`}
            </span>
          </div>
          <span className="local-badge">
            <i />
            {storageError
              ? '無法儲存，請保留分頁'
              : hydrated
                ? '草稿與進度已自動儲存'
                : '正在讀取進度'}
          </span>
        </header>
        <div className="lesson-heading">
          <div>
            <p className="eyebrow">WRITE GO. UNDERSTAND GO.</p>
            <h1>{playground ? '自由練習區' : chapter.title}</h1>
            <p>
              {playground
                ? '試驗你的想法，觀察型別與執行結果。'
                : chapter.subtitle}
            </p>
          </div>
          <span className="lesson-count">
            {String(lesson.index + 1).padStart(2, '0')} <span>/ 04 練習</span>
          </span>
        </div>
        {!playground && (
          <nav className="exercise-steps" aria-label="章節練習">
            {chapter.lessons.map((x, i) => (
              <button
                key={x.id}
                onClick={() => navigate(x.id)}
                aria-current={x.id === selected ? 'step' : undefined}
                className={x.id === selected ? 'active' : ''}
              >
                <span>{completed.has(x.id) ? <Check size={13} /> : i + 1}</span>
                {x.title}
              </button>
            ))}
          </nav>
        )}
        <div className="lab-grid">
          <article className="lesson-panel">
            <div className="panel-label">
              <BookOpen size={16} />
              {playground ? '練習工具箱' : '學習筆記'}
              <span>{playground ? '無完成條件' : '約 5–10 分鐘'}</span>
            </div>
            <h2>{playground ? '你的 Go 實驗室' : lesson.title}</h2>
            <p>
              {playground
                ? '使用完整的 package main 與 main 函式自由練習。編輯器提供語法上色，編譯診斷與執行結果由遠端 Go 服務回傳。'
                : lesson.concept}
            </p>
            <pre className="example">
              <code>
                {playground
                  ? 'package main\nimport "fmt"\nfunc main() { fmt.Println("Hello, Go!") }'
                  : lesson.example}
              </code>
            </pre>
            {!playground && (
              <>
                <div className="comparison">
                  <Tabs
                    value={saved.language}
                    onValueChange={(v) =>
                      setSaved((s) => ({ ...s, language: String(v) }))
                    }
                  >
                    <TabsList aria-label="對照語言" variant="line">
                      {['C++', 'C#', 'Python'].map((l) => (
                        <TabsTrigger key={l} value={l}>
                          {l}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {Object.entries(chapter.comparisons).map(([lang, text]) => (
                      <TabsContent key={lang} value={lang}>
                        <p>{text}</p>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
                <h3>輪到你了</h3>
                <p>{lesson.task}</p>
                <div className="requirements">
                  {lesson.requirements.map((r: string) => (
                    <p key={r}>
                      <Check size={15} />
                      {r}
                    </p>
                  ))}
                  {lesson.types && (
                    <p>
                      <Check size={15} />
                      推導型別符合契約
                    </p>
                  )}
                  {lesson.negative.length > 0 && (
                    <p>
                      <Check size={15} />
                      非法用法在編譯檢查時被拒絕
                    </p>
                  )}
                </div>
                <div className="help-actions">
                  <button
                    className="hint-button"
                    onClick={() =>
                      setHint((h) => Math.min(h + 1, lesson.hints.length))
                    }
                    disabled={hint >= lesson.hints.length}
                  >
                    <Lightbulb size={16} />
                    提示 {hint}/{lesson.hints.length}
                  </button>
                  <button
                    className="hint-button"
                    onClick={() => setShowSolution((s) => !s)}
                  >
                    {showSolution ? '收起解答' : '查看解答'}
                    <ArrowUpRight size={15} />
                  </button>
                </div>
                {hint > 0 && (
                  <div className="hint-box">
                    {lesson.hints.slice(0, hint).map((h: string, i: number) => (
                      <pre key={i}>{h}</pre>
                    ))}
                  </div>
                )}
                {showSolution && (
                  <div className="solution-box">
                    <p>參考解法 · 建議先自行完成</p>
                    <pre>
                      <code>{lesson.solution}</code>
                    </pre>
                    <button onClick={() => edit(lesson.solution)}>
                      放入編輯器
                    </button>
                    <p>仍須執行檢查才會記錄完成。</p>
                  </div>
                )}
              </>
            )}
            {playground && (
              <>
                <h3>快捷鍵</h3>
                <p>
                  ⌘ / Ctrl + Enter：執行
                  <br />
                  Ctrl + Space：補全
                  <br />
                  F1：編輯器指令
                  <br />
                  Ctrl + M：切換 Tab 鍵移動焦點
                </p>
                <h3>執行環境</h3>
                <p>
                  程式碼會傳送到遠端 Go Playground 沙箱編譯與執行。服務限制執行時間與外部存取；請使用標準庫，避免輸入機密資料。
                </p>
              </>
            )}
            <a
              className="docs-link"
              href="https://go.dev/tour/"
              target="_blank"
              rel="noreferrer"
            >
              A Tour of Go <ArrowUpRight size={14} />
            </a>
          </article>
          <section className="editor-panel" aria-label="程式編輯與結果">
            <div className="editor-top">
              <span>
                <span className="file-icon">GO</span>exercise.go
              </span>
              <div className="editor-tools">
                <span>Go · remote</span>
                <button
                  aria-label="重設程式碼"
                  title="重設程式碼"
                  onClick={() => setResetConfirm((s) => !s)}
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
            {resetConfirm && (
              <div className="reset-confirm">
                重設會覆蓋這題的草稿。
                <button
                  onClick={() => {
                    edit(playground ? playgroundCode : lesson.starter);
                    setResetConfirm(false);
                  }}
                >
                  確認重設
                </button>
                <button onClick={() => setResetConfirm(false)}>取消</button>
              </div>
            )}
            <CodeEditor
              value={code}
              onChange={edit}
              onRun={run}
              lessonId={selected}
              modules={modules}
            />
            <div className="editor-actions">
              <span>⌘ / Ctrl + Enter 執行</span>
              {busy ? (
                <button
                  className="run-button"
                  onClick={() => {
                    cancel();
                    setResultState('已停止');
                  }}
                >
                  <Square size={14} />
                  停止
                </button>
              ) : (
                <button
                  className="run-button"
                  disabled={!hydrated}
                  onClick={run}
                >
                  <Play size={15} />
                  執行與檢查
                </button>
              )}
            </div>
            <div className="results">
              <Tabs
                value={resultTab}
                onValueChange={(v) => setResultTab(String(v))}
              >
                <TabsList variant="line" aria-label="執行結果">
                  <TabsTrigger value="checks">
                    <CircleCheck size={15} />
                    檢查結果
                    {rows.length > 0
                      ? ` ${rows.filter((r) => r.pass).length}/${rows.length}`
                      : ''}
                  </TabsTrigger>
                  <TabsTrigger value="console">
                    <Terminal size={15} />
                    Console {logs.length > 0 ? logs.length : ''}
                  </TabsTrigger>
                </TabsList>
                <output className="run-status" aria-live="polite">
                  {stale ? '程式已修改，請重新執行檢查。' : resultState}
                </output>
                <TabsContent value="checks">
                  {error && (
                    <p className="error-message" role="alert">
                      {error}
                    </p>
                  )}
                  {diagnostics.map((d, i) => (
                    <div className="diagnostic" key={i}>
                      <strong>
                        TS{d.code} · {d.file === '/exercise.go' ? '' : d.file}{' '}
                        第 {d.line} 行
                      </strong>
                      <pre>{d.message}</pre>
                    </div>
                  ))}
                  {rows.map((r, i) => (
                    <div
                      key={i}
                      className={'test-row ' + (r.pass ? 'pass' : 'fail')}
                    >
                      {r.pass ? (
                        <CircleCheck size={16} />
                      ) : (
                        <CircleX size={16} />
                      )}
                      <div>
                        <span>{r.name}</span>
                        {!r.pass && (
                          <pre>
                            {r.detail ||
                              `預期：${r.expected}\n實際：${r.actual}`}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                  {!rows.length && !diagnostics.length && !error && (
                    <p className="empty-result">
                      寫下你的解法，讓編譯檢查與測試給你回饋。
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="console">
                  <pre className="console-output">
                    {logs.length
                      ? logs.join('\n')
                      : '尚無輸出。使用 fmt.Println(...) 觀察執行結果。'}
                  </pre>
                </TabsContent>
              </Tabs>
            </div>
            {!playground && completed.has(selected) && !stale && (
              <div className="next-lesson">
                <span>
                  <CircleCheck size={17} />
                  練習已完成
                </span>
                <button
                  onClick={() =>
                    navigate(
                      lessons[lessons.findIndex((l) => l.id === selected) + 1]
                        ?.id || 'playground',
                    )
                  }
                >
                  {selected === lessons.at(-1)?.id
                    ? '進入自由練習'
                    : '下一個練習'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </section>
        </div>
        <footer className="workspace-footer">
          <span>理解語法。寫下程式。讓測試說話。</span>
          <span>40 個練習 · Go 編譯與測試</span>
        </footer>
      </main>
    </>
  );
}
export default function Home() {
  return (
    <SidebarProvider>
      <Lab />
    </SidebarProvider>
  );
}
