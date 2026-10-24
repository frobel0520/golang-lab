# Go Lab 驗收紀錄

起始日期：2026-09-08；線上複驗：2026-09-29。

## 已驗證

- npm run check：TypeScript 檢查、14 項 Node 測試、oxlint 通過。
- npm run build：Vite production build 通過，包含 /golang-lab/ Pages 子路徑建置。
- 本機 http://127.0.0.1:5173/ 回應 HTTP 200。
- 本機 /go-compile 代理實際送到官方 Go Playground，成功回傳 `Go Lab smoke test`。
- 課程遠端驗證 80/80 通過：40 題解答皆通過，40 題起始碼皆不直接通關。curriculum-audit.json 記錄時間與教材／harness SHA-256。

## 發布驗證

- GitHub repo 與 Pages 已發布，使用者已明確授權公開。Actions run 34177922321 的 check 與 deploy 成功；首頁、JS、CSS、favicon、Monaco loader 均 HTTP 200。
- 網址：https://frobel0520.github.io/golang-lab/ 。驗證對應程式版本 c809fa7。
- 2026-09-25 README 記錄 Cloudflare Worker runner 已部署於 `https://golang-lab-runner.curio-lab.workers.dev`，`VITE_GO_RUNNER_URL` 已設為該網址。2026-09-29 在公開網站實際執行第 1 題：起始碼由遠端編譯回傳 0/3，正確零值解答透過 ⌘+Enter 執行後 3/3 通過、進度變為 1/40；重新整理後草稿與進度仍在。自由練習區的預設程式回傳 `Hello, Go!`。375px 模擬視窗可閱讀內容、開啟章節側欄與自由練習區。

## 未完成／限制

- Runner 已部署且公開站第 1 題的遠端編譯流程已驗證；其餘 39 題、停止流程與錯誤邊界尚未逐題線上驗收。
- 已驗證第 1 題的鍵盤執行、草稿／進度重新整理與 375px 模擬視窗；真實手機、完整切題／鍵盤巡覽與輔助使用 QA 仍待完成。
- Monaco 僅提供 Go 語法上色，沒有 gopls 即時型別診斷；執行時使用真正 Go 編譯器。
- 編輯器的執行取消會中止前端等待；上游已提交工作由官方服務自身限制停止。
- Go Playground 是外部依賴，其可用性與沙箱限制不由本專案保證。
- 題目與 harness 皆可見，進度是自學記錄，不作可信考試成績。

## SEC-P1-GO：2026-10-24 開發依賴修補

- 基線：`499cbab`。shadcn 已由上游移至 devDependencies；本次不改執行模型或教材。
- Vite 8.2.2 → 8.2.4；CLI 傳遞依賴 body-parser 2.3.0 → 2.4.0。其餘直接依賴與 CLI 版本保留，未用強制降版或停用安全規則。
- 以已核對的官方 portable Node 24.22.1，執行乾淨 `npm ci --ignore-scripts --no-audit --no-fund`。未載入真實環境設定或自動執行安裝腳本。
- 使用者已同意的 npm bulk advisory 僅收到公開 npm 套件名稱與解析版本；475 個公開套件，比對結果 total=0、high=0、critical=0。未傳送程式、專案名稱、私人套件或憑證。
- `npm run check`：型別、14 個既有 Node 測試、lint 通過。`npm run build`：`/golang-lab/` base path 通過，runner 使用合成 URL，因此產物不可直接用於正式部署。
- 真實 Go smoke：官方 Go Playground 在隔離服務編譯執行合成 hello 程式，專案現有 `parseRunnerResponse` 成功解析預期輸出；沒有在主機執行 Go。40 題完整遠端驗收未重跑，因課程／harness 未變。
- 本機 production build 的 1280px／375px Chromium smoke：首頁、執行按鈕、解答展開／收起通過；桌面自由練習切換通過，手機側欄切換本次未測。兩種寬度無 page error 或水平溢出；外部網路全數攔截，此測試未冒充正式 runner 驗收。
- 效能回歸：相同 base path、相同合成設定的 JS＋CSS gzip，修補前後均為 146,276 bytes（比值 1.000，門檻 ≤1.02），通過。JS／CSS 資產內容雜湊相同。基線 Node 24.14.1／Vite 8.2.2，修補後 Node 24.22.1／Vite 8.2.4；沒有把 build 耗時記為正式延遲。
- 證據：`security/reports/2026-10-24-p1.json`。正式部署／完整手機／正式效能未驗收；本次未發布，原本機分岔與未提交工作由整合者另行處理。
