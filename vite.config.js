import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  base: './' // 確保無論部署在 Cloudflare Pages、GitHub Pages 或子目錄中皆可正常存取資源
});
