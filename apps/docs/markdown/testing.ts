import { compile } from 'mdsvex';
import { mdsvexPlugins } from './headings.ts';

type Plugin = () => (tree: never, file: never) => unknown;

/** Compiles markdown the way the docs pipeline does, with only the given plugins. */
export async function render(
	markdown: string,
	{ remark = [], rehype = [] }: { remark?: Plugin[]; rehype?: Plugin[] } = {}
) {
	let data: Record<string, unknown> = {};
	const capture = () => (_tree: unknown, file: { data: Record<string, unknown> }) => {
		data = file.data;
	};
	const compiled = await compile(markdown, {
		smartypants: false,
		remarkPlugins: mdsvexPlugins(...remark),
		rehypePlugins: mdsvexPlugins(...rehype, capture)
	});
	const html = compiled!.code.replace(/^\s*<script context="module">[\s\S]*?<\/script>/, '');
	return { html: html.trim(), data };
}
