import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/bb-4xp-terminal/',
  server: { port: 3000, open: true },
});
