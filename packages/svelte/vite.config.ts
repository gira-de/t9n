import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'cobertura'],
    },
    reporters: ['junit', 'basic'],
    outputFile: 'report/junit.xml',
  },
});
