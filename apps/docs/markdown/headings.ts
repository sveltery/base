export type TocItem = { title: string; url: string; depth: number };

type MdNode = {
	type: string;
	depth?: number;
	value?: string;
	url?: string;
	children?: MdNode[];
	data?: Record<string, unknown>;
};

// mdsvex escapes code before remark plugins run, so decode it back for titles and slugs.
const decode = (value: string) =>
	value
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&#123;/g, '{')
		.replace(/&#125;/g, '}')
		.replace(/&amp;/g, '&');
const text = (node: MdNode): string =>
	node.value !== undefined ? decode(node.value) : (node.children ?? []).map(text).join('');
const hasLink = (node: MdNode): boolean =>
	node.type === 'link' || (node.children ?? []).some(hasLink);

export const slugify = (value: string): string =>
	value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-');

const EXCLUDE_FROM_TOC = '<!-- @exclude-table-of-contents -->';

/**
 * Gives h2 to h4 an id, h2 and h3 a self link, and exposes h2 and h3 as `metadata.toc`. As in Base
 * UI, `<!-- @exclude-table-of-contents -->` keeps the next heading and its subheadings out of the toc.
 */
export function headings() {
	return (tree: MdNode, file: { data: { fm?: Record<string, unknown> } }) => {
		const toc: TocItem[] = [];
		const used = new Set<string>();
		let exclude: 'next' | number | undefined;
		for (const node of tree.children ?? []) {
			if (node.type === 'html' && node.value?.trim() === EXCLUDE_FROM_TOC) exclude = 'next';
			if (node.type !== 'heading' || !node.depth || node.depth < 2 || node.depth > 4) continue;
			if (exclude === 'next') exclude = node.depth;
			else if (exclude !== undefined && node.depth <= exclude) exclude = undefined;
			const title = text(node);
			const base = slugify(title);
			let id = base;
			for (let count = 1; used.has(id); count++) id = `${base}-${count}`;
			used.add(id);
			node.data = { ...node.data, hProperties: { id, class: `MdH${node.depth}` } };
			// A link cannot contain a link, so a heading that already has one keeps its id without the self link.
			if (node.depth <= 3 && !hasLink(node))
				node.children = [
					{
						type: 'link',
						url: `#${id}`,
						data: { hProperties: { class: 'HeadingLink' } },
						children: node.children ?? []
					}
				];
			if (node.depth <= 3 && exclude === undefined)
				toc.push({ title, url: `#${id}`, depth: node.depth });
		}
		file.data.fm = { ...file.data.fm, toc };
	};
}

const CLASSES: Record<string, string> = {
	paragraph: 'MdP',
	list: 'MdUl',
	listItem: 'MdListItem',
	emphasis: 'MdEm',
	link: 'Link'
};

// An HTML tag in a code span, such as `<button>`, is shown as a tag rather than as code.
const HTML_TAG = /^<\/?[a-z][a-z0-9-]*\s*\/?>$/;

/** Gives prose elements the classes Base UI's MDX components give them. */
export function elements() {
	const visit = (node: MdNode) => {
		const name =
			node.type === 'list' && (node as { ordered?: boolean }).ordered ? 'MdOl' : CLASSES[node.type];
		const existing = node.data?.hProperties as Record<string, unknown> | undefined;
		if (name && !existing?.class)
			node.data = { ...node.data, hProperties: { ...existing, class: name } };
		if (node.type === 'inlineCode') {
			const tag = HTML_TAG.test(decode(node.value ?? ''));
			node.data = {
				...node.data,
				hProperties: { class: tag ? 'Code MdCode MdTag' : 'Code MdCode', 'data-inline': '' }
			};
		}
		node.children?.forEach(visit);
	};
	return (tree: MdNode) => visit(tree);
}
