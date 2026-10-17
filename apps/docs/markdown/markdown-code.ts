import type { MdNode } from './headings.ts';

const LANG_SUFFIX = /^([\s\S]+)\{:(\w+)\}$/;

/** A code span's code and language, from a `{:lang}` suffix such as `` `<Popover />{:svelte}` ``. */
export function codeLanguage(value: string, defaultLanguage = 'tsx') {
	const match = LANG_SUFFIX.exec(value);
	return { code: match?.[1] ?? value, language: match?.[2] ?? defaultLanguage };
}

/**
 * The inline part of Base UI's `transformMarkdownCode`. A code span gets a `language-*` class,
 * from a `{:lang}` suffix such as `` `<Popover />{:svelte}` ``, or `tsx` by default.
 */
export function markdownCode({ defaultLanguage = 'tsx' }: { defaultLanguage?: string } = {}) {
	return (tree: MdNode) => {
		const visit = (node: MdNode, inTable = false) => {
			if (node.type === 'inlineCode') {
				// mdsvex has already escaped the braces, and does not unescape `\|` in a table as GFM does.
				let value = (node.value ?? '').replace(/&#123;/g, '{').replace(/&#125;/g, '}');
				if (inTable) value = value.replace(/\\\|/g, '|');
				const { code, language } = codeLanguage(value, defaultLanguage);
				node.value = code.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
				const hProperties = node.data?.hProperties as Record<string, unknown> | undefined;
				node.data = {
					...node.data,
					hProperties: {
						...hProperties,
						class: [hProperties?.class, `language-${language}`].filter(Boolean).join(' ')
					}
				};
			}
			node.children?.forEach((child) => visit(child, inTable || node.type === 'table'));
		};
		visit(tree);
	};
}
