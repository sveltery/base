import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/postcss';
import customMedia from 'postcss-custom-media';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Shared authored docs live beside the Kit 2 fixture app; compile them with this Kit 3 project.
  tsconfig: './tsconfig.json',
  resolve: { alias: { '@docs-source': fileURLToPath(new URL('./src/lib/docs', import.meta.url)) } },
  css: { postcss: { plugins: [tailwindcss(), customMedia()] } },
  plugins: [sveltekit({
    adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
    prerender: { entries: ['*'] },
  })],
});
