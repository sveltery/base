import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  // Shared authored docs live beside the Kit 2 fixture app; compile them with this Kit 3 project.
  tsconfig: './tsconfig.json',
  plugins: [sveltekit({
    adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
    prerender: { entries: ['*'] },
  })],
});
