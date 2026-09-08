# 系統設計

- React + Vite 靜態前端部署 GitHub Pages，VITE_BASE_PATH 支援 repository 子路徑。
- Monaco 編輯器使用 Go 語法模式，資產由 npm 安裝內容複製至 public/vendor，不依賴執行期 CDN。
- curriculum/lessons.mjs 為教材及測試唯一來源。每题起始碼與解答皆為 package main，測試組裝器加入 main harness。
- lib/go-source.mjs 負責 Go 測試來源與結果解析；lib/run-code.ts 管理遠端請求。
- worker 目錄提供固定上游的 Go Playground 代理。前端以 VITE_GO_RUNNER_URL 設定端點。
- 獨立 golang-lab:v1 儲存鍵；從不讀寫 TypeScript Lab 進度。
- 這是自學驗證工具，測試與解答對學員可見，不作為防作弊或可信考試系統。
