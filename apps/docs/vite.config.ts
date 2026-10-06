import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/postcss';
import customMedia from 'postcss-custom-media';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// Vite scans the canonical authored TS imported from the fixture app and reads
// its nearest tsconfig, which extends Kit 2's generated configuration. A clean
// docs-only start must generate that real prerequisite before dependency scan.
execFileSync(
  process.execPath,
  [
    fileURLToPath(new URL('../fixtures/node_modules/@sveltejs/kit/svelte-kit.js', import.meta.url)),
    'sync',
  ],
  {
    cwd: fileURLToPath(new URL('../fixtures/', import.meta.url)),
    stdio: 'inherit',
  },
);

export default defineConfig({
  // Shared authored docs live beside the Kit 2 fixture app; compile them with this Kit 3 project.
  tsconfig: './tsconfig.json',
  resolve: {
    alias: {
      '@docs-source': fileURLToPath(new URL('./src/lib/docs', import.meta.url)),
    },
  },
  css: { postcss: { plugins: [tailwindcss(), customMedia()] } },
  plugins: [
    sveltekit({
      adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
      prerender: { entries: ['*'] },
    }),
  ],
});
