# Go Lab

- 工作分支使用 feature/<task-id>，修改前確認分支。
- curriculum/lessons.mjs 是教材與測試契約唯一來源。
- 保持 docs/project-plan.md、project-sa.md、project-sd.md 與 task-breakdown.md 一致。
- 必須真正編譯執行 Go，禁止以字串比對假裝測試通過。
- 不在本機主機直接執行學員程式。使用遠端隔離服務。
- 課程或引擎變更需 npm run check、npm run build；課程需驗證所有解答通過、起始碼不通關。
- 未執行或失敗的驗證如實寫入 docs/release-audit.md。
- 邊界清楚的 coding 工作利用 subagent；主 agent 整合及驗證。
- 不提交 credentials、node_modules 或生成的 vendor 資產。
