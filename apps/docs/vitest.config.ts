import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  plugins: [svelte()],
  resolve: { conditions: ['browser'] },
  test: {
    environment: 'jsdom',
    include: ['test-dom/*.test.ts'],
    maxWorkers: 1,
    fileParallelism: false,
    retry: 0,
  },
});
