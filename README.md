# Go Lab

參考 TypeScript Lab 的繁體中文 Go 語法實戰網站：10 章、40 題，包含 Monaco 編輯器、語言對照、提示／解答、真實 Go 編譯與測試、草稿／進度保存及自由練習區。

網站：https://frobel0520.github.io/golang-lab/ 。線上可直接編譯執行：代理 Worker 部署在 https://golang-lab-runner.curio-lab.workers.dev ，GitHub Actions repository variable `VITE_GO_RUNNER_URL` 已設定為該網址（2026-09-25）。

## 學習系列與維運

- Go Lab 是 [Learning Atlas](https://frobel0520.github.io/learning-atlas/)「程式語言」路線的一站；首頁有返回 Learning Atlas 的連結（2026-09-25 起）。
- `index.html` 載入 Harbor 維護腳本（`data-project="golang-lab"`，2026-09-15 起）：Harbor 開啟維護模式時顯示全螢幕維護畫面，Harbor 連不上時頁面照常顯示。

## 本機開發

Node.js >= 22.13。不需本機 Go toolchain。

```sh
npm ci
npm run dev
```

開發模式透過 Vite 代理 Go 官方 Playground；需網路。練習只提供函式，系統加入測試 main；自由練習區請提供完整 package main 與 main 函式。編輯器提供語法上色，沒有 gopls 即時語意診斷；正式診斷以遠端編譯結果為準。

```sh
npm run check
npm run build
node scripts/verify-curriculum.mjs
```

最後一個指令會將課程解答與起始碼傳給官方 Go Playground，並寫入驗收報告。

## GitHub Pages 與遠端代理

GitHub Pages 無法直接呼叫官方 Playground（上游未提供 CORS）。部署 worker 代理後，設定 GitHub Actions repository variable `VITE_GO_RUNNER_URL` 為 Worker HTTPS 網址。`.github/workflows` 會檢查及建置，再發布 main 到 Pages。

```sh
npx wrangler login
npx wrangler deploy --config worker/wrangler.jsonc
```

詳細代理設定見 worker/README.md。正式環境未設定服務時會清楚顯示尚未設定，不會假裝執行成功。可用性、執行時間、網路存取與支援套件受官方 Playground 限制。

教材唯一來源：curriculum/lessons.mjs。完成數表示歷史通過，修改草稿後須重新執行確認目前版本。這是自學工具，不提供防作弊考試功能。

## 文件

- [計畫](docs/project-plan.md)
- [系統分析](docs/project-sa.md)
- [系統設計](docs/project-sd.md)
- [任務拆解](docs/task-breakdown.md)
- [驗收](docs/release-audit.md)

教材參考 [Go 語言規格](https://go.dev/ref/spec)、[A Tour of Go](https://go.dev/tour/) 與 [Go Playground](https://go.dev/play/)，練習自行撰寫。
