import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import typography from 'remark-typography';
import { codeInline } from './markdown/code-inline.ts';
import { concatHeadings } from './markdown/concat-headings.ts';
import { excludeHeading } from './markdown/exclude-heading.ts';
import { headingTags } from './markdown/heading-tags.ts';
import { elements, headings, mdsvexPlugins } from './markdown/headings.ts';
import { markdownCode } from './markdown/markdown-code.ts';
import { metadata } from './markdown/metadata.ts';
import { docsDemos } from './markdown/demos.ts';
import { docsMarkdown } from './markdown/llms.ts';
import { docsComponents, highlightCode } from './markdown/preprocess.ts';
import { relativePaths } from './markdown/relative-paths.ts';
import { sitemap } from './markdown/sitemap.ts';
import { slug } from './markdown/slug.ts';
import { docsTypes } from './markdown/types.ts';

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

// The library is read from source, so the site always documents the checked-out code.
const lib = path('../../src/lib');
// Each docs page is `<section>/<slug>/+page.md` in this route group.
const routes = path('./src/routes/(docs)');

export default defineConfig({
	// tsconfig.json maps the same paths for type checking.
	resolve: { alias: [{ find: /^@sveltery\/base(?=\/|$)/, replacement: lib }] },
	plugins: [
		tailwindcss(),
		docsMarkdown({ routes, lib }),
		// Upstream's `app/sitemap/index.ts`: each side nav heading and its section index, in order.
		sitemap({
			routes,
			lib,
			sections: {
				Overview: 'overview',
				Handbook: 'handbook',
				Components: 'components',
				Utils: 'utils'
			}
		}),
		docsTypes({ routes, lib }),
		docsDemos({ routes }),
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
					// Upstream's `docs/next.config.mjs` plugin lists, in its order.
					remarkPlugins: mdsvexPlugins(
						headingTags,
						metadata,
						typography,
						excludeHeading,
						relativePaths({ routes: path('./src/routes') }),
						markdownCode,
						elements
					),
					rehypePlugins: mdsvexPlugins(codeInline, slug, concatHeadings, headings),
					layout: path('./src/lib/components/DocsPage.svelte'),
					highlight: { highlighter: highlightCode }
				}),
				docsComponents({ routes, lib })
			],
			prerender: { handleHttpError: 'fail', handleMissingId: 'fail' }
		})
	]
});
