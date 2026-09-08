# Go Lab 驗收紀錄

日期：2026-09-08。

## 已驗證

- npm run check：TypeScript 檢查、14 項 Node 測試、oxlint 通過。
- npm run build：Vite production build 通過，包含 /golang-lab/ Pages 子路徑建置。
- 本機 http://127.0.0.1:5173/ 回應 HTTP 200。
- 本機 /go-compile 代理實際送到官方 Go Playground，成功回傳 `Go Lab smoke test`。
- 課程遠端驗證 80/80 通過：40 題解答皆通過，40 題起始碼皆不直接通關。curriculum-audit.json 記錄時間與教材／harness SHA-256。

## 發布驗證

- GitHub repo 與 Pages 已發布，使用者已明確授權公開。Actions run 34177922321 的 check 與 deploy 成功；首頁、JS、CSS、favicon、Monaco loader 均 HTTP 200。
- 網址：https://frobel0520.github.io/golang-lab/ 。驗證對應程式版本 c809fa7。

## 未完成／限制

- Cloudflare Worker 尚未部署，使用者目前無現成 runner。需 Wrangler 登入、部署並設定 GitHub variable VITE_GO_RUNNER_URL。
- 未實際做瀏覽器互動 QA：草稿還原、切題、停止、行動版與鍵盤互動不宣稱已驗證。
- Monaco 僅提供 Go 語法上色，沒有 gopls 即時型別診斷；執行時使用真正 Go 編譯器。
- 編輯器的執行取消會中止前端等待；上游已提交工作由官方服務自身限制停止。
- Go Playground 是外部依賴，其可用性與沙箱限制不由本專案保證。
- 題目與 harness 皆可見，進度是自學記錄，不作可信考試成績。
