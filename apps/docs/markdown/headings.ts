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

/** Gives h2 to h4 an id and a self link, and exposes h2 and h3 as `metadata.toc`. */
export function headings() {
	return (tree: MdNode, file: { data: { fm?: Record<string, unknown> } }) => {
		const toc: TocItem[] = [];
		const used = new Set<string>();
		for (const node of tree.children ?? []) {
			if (node.type !== 'heading' || !node.depth || node.depth < 2 || node.depth > 4) continue;
			const title = text(node);
			const base = slugify(title);
			let id = base;
			for (let count = 1; used.has(id); count++) id = `${base}-${count}`;
			used.add(id);
			node.data = { ...node.data, hProperties: { id } };
			// A link cannot contain a link, so a heading that already has one keeps its id without the self link.
			if (!hasLink(node))
				node.children = [{ type: 'link', url: `#${id}`, children: node.children ?? [] }];
			if (node.depth <= 3) toc.push({ title, url: `#${id}`, depth: node.depth });
		}
		file.data.fm = { ...file.data.fm, toc };
	};
}
