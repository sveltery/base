import { createHighlighter, type ShikiTransformer } from 'shiki';

const themes = { light: 'github-light-default', dark: 'github-dark-default' } as const;
const langs = [
	'svelte',
	'ts',
	'js',
	'json',
	'jsonc',
	'css',
	'html',
	'bash',
	'diff',
	'text',
	'yaml'
];
const highlighter = createHighlighter({ themes: Object.values(themes), langs });

const clean: ShikiTransformer = {
	pre(node) {
		delete node.properties.tabindex;
	}
};

/** Highlights code into a `<pre>` that carries both themes as CSS variables. */
export async function highlight(code: string, lang = 'text'): Promise<string> {
	const shiki = await highlighter;
	const language = shiki.getLoadedLanguages().includes(lang) ? lang : 'text';
	return shiki.codeToHtml(code.replace(/\n$/, ''), {
		lang: language,
		themes,
		defaultColor: false,
		transformers: [clean]
	});
}
