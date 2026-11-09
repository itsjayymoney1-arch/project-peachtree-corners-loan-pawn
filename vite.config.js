import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // enables relative asset resolution on any hosting path
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});
