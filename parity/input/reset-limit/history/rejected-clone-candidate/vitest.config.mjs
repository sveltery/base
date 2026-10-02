import { svelte } from '/workspace/base/packages/base/node_modules/@sveltejs/vite-plugin-svelte/src/index.js';
import { defineConfig } from '/workspace/base/packages/base/node_modules/vitest/dist/config.js';
export default defineConfig({ root: '/workspace/base/packages/base', plugins: [svelte()], resolve: { conditions: ['browser'] }, test: { environment: 'jsdom', include: ['/tmp/input-clone-reset-proof/*.test.ts'] } });
