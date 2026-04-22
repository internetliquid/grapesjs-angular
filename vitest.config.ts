import { defineConfig } from 'vitest/config';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular({ tsconfig: 'projects/grapesjs-angular/tsconfig.spec.json' })],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['projects/grapesjs-angular/src/**/*.spec.ts'],
    setupFiles: ['projects/grapesjs-angular/src/test-setup.ts'],
  },
});
