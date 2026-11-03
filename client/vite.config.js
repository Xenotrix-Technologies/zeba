import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '..'), '');
  const serverEnv = loadEnv(mode, path.resolve(__dirname, '../server'), '');
  const clientEnv = loadEnv(mode, process.cwd(), '');

  const mergedEnv = {
    ...rootEnv,
    ...serverEnv,
    ...clientEnv
  };

  return {
    plugins: [react()],
    define: {
      '__APP_ENV__': JSON.stringify(mergedEnv)
    },
    server: {
      port: 5000,
      strictPort: true,
      host: true,
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_URL || 'http://localhost:5001',
          changeOrigin: true
        }
      }
    },
    preview: {
      port: 5000,
      strictPort: true,
      host: true,
      proxy: {
        '/api': {
          target: process.env.VITE_BACKEND_URL || 'http://localhost:5001',
          changeOrigin: true
        }
      }
    },
    build: {
      target: 'es2020',
      minify: 'esbuild',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'icons-vendor': ['lucide-react'],
            'ui-vendor': ['canvas-confetti', 'axios']
          }
        }
      }
    }
  };
});
