import path from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'autoUpdate',
    manifest: {
      name: 'Orchestra',
      short_name: "Orchestra",
    }
  })],
  assetsInclude: ['**/*.txt'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})
