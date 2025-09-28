import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.test.jsx', 'test/**/*.test.jsx'],
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});