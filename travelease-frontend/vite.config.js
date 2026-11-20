import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const backendUrl = process.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5175,
    strictPort: true,
    proxy: {
      "/api": { target: backendUrl, changeOrigin: true },
      "/sanctum": { target: backendUrl, changeOrigin: true },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test-setup.js",
    globals: true,
  },
});
