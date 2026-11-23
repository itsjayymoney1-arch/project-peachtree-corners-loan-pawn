import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const previewOrigin = process.env.MANUS_ADDON_PREVIEW_PUBLIC_ORIGIN;
let allowedHosts = [];
try {
  if (previewOrigin) allowedHosts = [new URL(previewOrigin).hostname];
} catch {
  // Vite's default local-host allowlist remains in effect.
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts,
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
