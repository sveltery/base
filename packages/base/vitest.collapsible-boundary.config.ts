// Equal development compilation and no HMR for Source/native boundary witnesses.
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  plugins: [svelte({ compilerOptions: { dev: true, hmr: false } })],
  resolve: { conditions: ['browser'] },
  test: { environment: 'jsdom', include: ['tests/dom/collapsible-source-boundary.test.ts'], maxWorkers: 1 },
});
