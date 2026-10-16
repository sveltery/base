import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { elements, headings } from './markdown/headings.ts';
import { docsMarkdown } from './markdown/llms.ts';
import { docsComponents, highlightCode } from './markdown/preprocess.ts';

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

// The library is read from source, so the site always documents the checked-out code.
const lib = path('../../src/lib');
// Generated demo components. The root ignore files skip `dist`, and svelte-check, unlike for
// `.svelte-kit`, type-checks it.
const demos = path('./dist/demos');

export default defineConfig({
	// tsconfig.json maps the same paths for type checking.
	// Vite's dev watcher skips `build.outDir`, which defaults to `dist`. SvelteKit sets its own outDir
	// for builds, so this only lets the dev server see demo edits.
	build: { outDir: '.svelte-kit/output' },
	resolve: { alias: [{ find: /^@sveltery\/base(?=\/|$)/, replacement: lib }] },
	plugins: [
		tailwindcss(),
		docsMarkdown({ pages: path('./content'), lib }),
		sveltekit({
			adapter: adapter(),
			extensions: ['.svelte', '.md'],
			// mdsvex pages compile in legacy mode, because they export `metadata` from a module script.
			compilerOptions: {
				runes: ({ filename }) =>
					filename.includes('/node_modules/') || filename.endsWith('.md') ? undefined : true
			},
			preprocess: [
				mdsvex({
					extensions: ['.md'],
					smartypants: false,
					remarkPlugins: [headings, elements],
					highlight: { highlighter: highlightCode }
				}),
				docsComponents({ pages: path('./content'), demos, lib })
			],
			prerender: { handleHttpError: 'fail', handleMissingId: 'fail' }
		})
	]
});
