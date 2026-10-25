# 任務拆解

- T01：參考 TypeScript Lab 並確認 Go 執行架構。
- T02：Go 編輯器、教材頁、草稿／進度及取消流程。
- T03：10 章 40 題教材、測試與參考解答。
- T04：真實 Go 編譯執行、結果解析與代理。
- T05：驗證所有解答／起始碼、前端 check/build。
- T06：GitHub Pages workflow、遠端連線與部署。

實際完成證據以 release-audit.md 為準。

## SEC-P1-GO：開發工具依賴修補（2026-10-24）

- **Goal**：清除本次 npm lockfile 的 high／critical 公告，保留既有課程與遠端執行契約。
- **Input contract**：以 `499cbab` 的正式／開發依賴分界為基線；套件版本與公告以 2026-10-24 查詢為準。
- **Output artifact**：Vite 8.2.4、body-parser 2.4.0 的最小依賴更新與固定 lockfile。
- **depends_on**：無；沿用上游已將 shadcn 移至 devDependencies 的修補。
- **Out of scope**：課程、Go harness、Worker、正式部署與原工作區歷史整合。
- **Acceptance checks**：公開套件 advisory 比對 high／critical 為 0；`npm run check` 與 Pages 子路徑 build 通過。
- **Fixture or test data**：合成 runner URL、本機隔離前端及官方 Go Playground 的 hello 程式；不執行本機學員 Go。
- **Performance gate**：相同 Pages base path 的 production JS＋CSS gzip 總量不超過修補前 102%；不以測試耗時代替正式延遲。
- **Evidence path**：`security/reports/2026-10-24-p1.json`、`docs/release-audit.md`。
- **Scope status**：使用者已授權本次 P1 修補；產品需求與 SA／SD 介面未變更。
