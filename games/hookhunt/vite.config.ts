import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@framework-ui': path.resolve(__dirname, '../../packages/framework-ui/src'),
      '@game-core': path.resolve(__dirname, '../../packages/game-core/src'),
      '@shared-config': path.resolve(__dirname, '../../packages/shared-config')
    }
  },
  plugins: [react()],
  server: {
    port: 9992,
    strictPort: true,
  }
});
