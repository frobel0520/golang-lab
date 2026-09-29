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
- 2026-09-25 README 記錄 Cloudflare Worker runner 已部署於 `https://golang-lab-runner.curio-lab.workers.dev`，`VITE_GO_RUNNER_URL` 已設為該網址。2026-09-29 在公開網站實際執行第 1 題：起始碼由遠端編譯回傳 0/3，正確零值解答透過 ⌘+Enter 執行後 3/3 通過、進度變為 1/40；重新整理後草稿與進度仍在。375px 模擬視窗可閱讀內容並開啟章節側欄。

## 未完成／限制

- Runner 已部署且公開站第 1 題的遠端編譯流程已驗證；其餘 39 題、停止流程與錯誤邊界尚未逐題線上驗收。
- 已驗證第 1 題的鍵盤執行、草稿／進度重新整理與 375px 模擬視窗；真實手機、完整切題／鍵盤巡覽與輔助使用 QA 仍待完成。
- Monaco 僅提供 Go 語法上色，沒有 gopls 即時型別診斷；執行時使用真正 Go 編譯器。
- 編輯器的執行取消會中止前端等待；上游已提交工作由官方服務自身限制停止。
- Go Playground 是外部依賴，其可用性與沙箱限制不由本專案保證。
- 題目與 harness 皆可見，進度是自學記錄，不作可信考試成績。
