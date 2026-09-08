# Go runner proxy

From the `golang-lab` project root, authenticate Wrangler once and deploy:

```sh
npx wrangler login
npx wrangler deploy --config worker/wrangler.jsonc
```

Set the deployed URL as `VITE_GO_RUNNER_URL` for the frontend build. The worker
accepts JSON `POST` requests containing `{ "code": "..." }`, forwards only the
program to the fixed official Go compile service, and allows the configured
`ALLOWED_ORIGIN` only.
