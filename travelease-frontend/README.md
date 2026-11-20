# TravelEase React SPA

React 19, Vite 8, Material UI 7, React Router 7, Axios, React Hook Form/Zod, Recharts, and MUI Data Grid. Dependency versions are pinned by package-lock.json.

```bash
npm ci --ignore-scripts
npm run dev
npm test
npm run build
```

The local URL is http://127.0.0.1:5175. Vite proxies `/api` and `/sanctum` to Laravel at http://127.0.0.1:8002. In a deployed SPA, configure a same-site API origin with `VITE_API_URL` and exact Laravel CORS/Sanctum origins. Build output is `dist/`; the production web server must serve `index.html` for SPA routes. The local proxy is not included in production build output.

All production UI records come from Laravel. Mocked API fixtures exist only in isolated component tests. See [component documentation](../docs/frontend-components.md) and [verification limits](../docs/frontend-testing.md).
