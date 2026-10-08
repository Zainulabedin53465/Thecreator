import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,   // exposes a LAN URL so you can test on your real phone
    port: 5173,
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 800,
  },
});
