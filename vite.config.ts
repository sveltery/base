import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { chromiumLaunchOptions } from './scripts/chromium.js';

// Unit tests copied from an upstream that tests against jsdom, kept as upstream wrote them.
const jsdomTests = ['src/lib/resizable/**/*.test.ts'];

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
			// See https://svelte.dev/docs/kit/adapters for more information about adapters.
			adapter: adapter(),
			// The form fixtures under src/routes/fixtures/form use remote form functions.
			experimental: { remoteFunctions: true }
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright({ launchOptions: chromiumLaunchOptions }),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['{src,packages/*/src}/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./src/tests/setup.ts']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['{src,packages/*/src}/**/*.{test,spec}.{js,ts}', 'eslint/**/*.spec.ts'],
					exclude: ['{src,packages/*/src}/**/*.svelte.{test,spec}.{js,ts}', ...jsdomTests]
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'jsdom',
					environment: 'jsdom',
					include: jsdomTests,
					setupFiles: ['./src/tests/resizable-setup.ts']
				}
			},

			{
				test: {
					name: 'docs',
					root: fileURLToPath(new URL('./apps/docs', import.meta.url)),
					environment: 'node',
					include: ['**/*.test.ts']
				}
			}
		]
	}
});
