import type { MdNode } from './headings.ts';

const LANG_SUFFIX = /^([\s\S]+)\{:(\w+)\}$/;

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
				const match = LANG_SUFFIX.exec(value);
				node.value = (match?.[1] ?? value).replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');
				const hProperties = node.data?.hProperties as Record<string, unknown> | undefined;
				const language = `language-${match?.[2] ?? defaultLanguage}`;
				node.data = {
					...node.data,
					hProperties: {
						...hProperties,
						class: [hProperties?.class, language].filter(Boolean).join(' ')
					}
				};
			}
			node.children?.forEach((child) => visit(child, inTable || node.type === 'table'));
		};
		visit(tree);
	};
}
