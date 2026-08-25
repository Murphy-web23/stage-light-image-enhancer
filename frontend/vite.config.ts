import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// This app has no server of its own — the FastAPI backend in ../api.py is the
// only server. `vite build` emits straight into ../web, which api.py already
// serves as static files, so no backend changes are needed to pick it up.
// `vite dev` proxies /api to the FastAPI dev server instead (see api.py /
// .claude/launch.json for the port it runs on).
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: path.resolve(__dirname, '../web'),
      emptyOutDir: true,
    },
    server: {
      proxy: {
        '/api': {
          target: process.env.BACKEND_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  };
});
