/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    __ROUTER_BASENAME__: JSON.stringify(''),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: true,
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@rhds/elements/rh-icon/rh-icon': path.resolve(
        __dirname,
        './node_modules/@rhds/elements/elements/rh-icon/rh-icon.js',
      ),
    },
  },
});
