import path from 'node:path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { plugin as mdPlugin, Mode } from 'vite-plugin-markdown';

// https://vite.dev/config/
export default defineConfig({
  define: {
    __COMMIT_SHA__: JSON.stringify(process.env.CF_PAGES_COMMIT_SHA ?? 'unknown'),
  },
  plugins: [
    react(),
    tailwindcss(),
    mdPlugin({
      mode: [Mode.HTML],
    }),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Orchestra',
        short_name: "Orchestra",
        background_color: "#111828",
        theme_color: '#1E2938',
        screenshots: [
          {
            form_factor: 'wide',
            src: '/wide-screen.png',
            sizes: '1920x978'
          }
        ],
        icons: [
          {
            src: '/icon.png',
            sizes: '1024x1024'
          }
        ]
      },
      devOptions: {
        enabled: true,
      }
    })],
  assetsInclude: ['**/*.txt'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})
