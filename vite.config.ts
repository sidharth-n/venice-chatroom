import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/venice-photo': {
        target: 'https://outerface.venice.ai',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/venice-photo/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Strip restrictive cross-origin headers for dev only
            delete proxyRes.headers['cross-origin-resource-policy'];
            delete proxyRes.headers['cross-origin-opener-policy'];
            delete proxyRes.headers['cross-origin-embedder-policy'];
            delete proxyRes.headers['content-security-policy'];
          });
        },
      },
    },
  },
});
