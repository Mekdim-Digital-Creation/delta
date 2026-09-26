import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Base path for Vercel/GitHub deployment
  base: process.env.VITE_BASE_PATH || '/delta',

  server: {
    port: 5173,

    // Proxy /api to the Express server so the client can use relative URLs.
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              name: 'vendor',
              test: /node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
            },
            {
              name: 'motion',
              test: /node_modules[\\/]framer-motion[\\/]/,
            },
            {
              name: 'icons',
              test: /node_modules[\\/]lucide-react[\\/]/,
            },
          ],
        },
      },
    },
  },
});