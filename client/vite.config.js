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
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
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
