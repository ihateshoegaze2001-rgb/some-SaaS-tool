import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The client is a separate npm project so it can have its own build step
// (JSX, bundling, etc.) without dragging that complexity into server.js.
//
// - `npm run dev` (root) runs this on its own dev server (port 5173) and
//   proxies /api calls to Express on port 3000, so you get instant reloads
//   while working on the UI.
// - `npm start` (root) runs `vite build` first, which outputs static files
//   to ../dist. Express then just serves that folder — no Vite involved
//   in production, so the app has no "build server" to keep running.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
