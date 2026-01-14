import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ''); // Use process.cwd() instead of '.'
  return {
    base: '/', // Add this to ensure correct pathing
    // ... rest of your config
  }
})
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
