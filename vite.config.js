import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Thecreator/',

  server: {
    host: true,
    port: 5173,
  },

  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 800,
  },
});
