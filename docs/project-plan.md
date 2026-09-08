# Go Lab 專案計畫

日期：2026-09-08。狀態：實作中。已確認 GitHub Pages 前端＋遠端 Go 執行服務。

## 目標

參考相鄰的 typescript-lab，建立給熟悉 C++、C#、Python、TypeScript 的開發者使用的繁體中文 Go 實戰學習網站。沿用短教材、語言對照、真實編輯器、分層提示、參考解答、執行測試、草稿與進度保存、自由練習區。

## 課程草案

10 章、40 題，每章四題：

1. 基本語法：變數與零值、明確轉型、條件與迴圈、switch。
2. 函式：多回傳值、具名回傳、variadic、closure。
3. 集合：array 與 slice、append 與底層陣列、map 與 comma-ok、range 與複製。
4. 字串：byte 與 rune、UTF-8 遍歷、字串組裝、解析與驗證。
5. 資料模型：struct、pointer、value receiver、pointer receiver。
6. Interface：隱式實作、小介面組合、type assertion/switch、typed nil。
7. 錯誤與資源：error 回傳、wrapping 與 errors.Is、defer、panic/recover 邊界。
8. 泛型：型別參數、constraints、泛型 slice 函式、comparable 與集合。
9. 並行：goroutine 與 WaitGroup、channel、select、context 取消。
10. 標準庫實戰：JSON、io.Reader、table-driven tests、httptest。

## 學習流程

選章節與題目 → 閱讀概念及語言對照 → 編輯 Go → 編譯並執行測試 → 顯示診斷及輸出 → 全通過才記錄完成 → 下一題。

查看解答本身不增加完成數。修改程式後舊結果標記過期；停止與切題必須忽略遲到的執行結果。儲存採獨立的 Go Lab key，不與 TypeScript Lab 混用。

## 執行架構決策

已確認 GitHub Pages 靜態前端＋Cloudflare Worker 代理官方 Go Playground。官方服務不提供前端所需 CORS，因此代理負責固定上游轉送與來源限制。開發時由 Vite 提供同源代理；正式版使用 VITE_GO_RUNNER_URL。

使用者目前沒有現成 Worker；登入與部署尚待完成。公開 GitHub repo 建立遭自動核准審查攔截，需使用者明確授權公開原始碼後才能發布。

不以字串比對或假執行取代編譯和測試。不把未通過驗證的題目記錄完成。

## 驗收條件

- 40 題均包含教材、語言對照、起始碼、提示、解答與可執行測試。
- 全部解答通過，全部起始碼不直接通關。
- 驗證編譯錯誤、測試失敗、逾時、停止與切題競態。
- 型別檢查、測試、lint、production build 通過後才記錄完成。
- 未實際執行的瀏覽器與部署驗證標記 pending。

## 參考

- 本機 ../typescript-lab/README.md 與 docs/project-plan.md。
- Go 官方 Playground：https://go.dev/play/。
- Go 官方語言規格：https://go.dev/ref/spec。
