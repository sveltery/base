import type { MdsvexOptions } from 'mdsvex';

export type TocItem = { title: string; url: string; depth: number };

export type MdNode = {
	type: string;
	depth?: number;
	value?: string;
	url?: string;
	children?: MdNode[];
	data?: Record<string, unknown>;
};

export type HastNode = {
	type: string;
	tagName?: string;
	value?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
};

/**
 * mdsvex 0.12 types its plugin lists with unified 11 when that is installed, but runs unified 9,
 * whose trees `MdNode` and `HastNode` describe.
 */
export const mdsvexPlugins = (...plugins: unknown[]) =>
	plugins as NonNullable<MdsvexOptions['remarkPlugins']>;

// mdsvex escapes code before remark plugins run, so decode it back for titles and slugs.
export const decode = (value: string) =>
	value
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&#123;/g, '{')
		.replace(/&#125;/g, '}')
		.replace(/&amp;/g, '&');

/** A node's text. mdsvex renders a `[Tag]` that nothing defines as its bracketed text. */
export const text = (node: MdNode): string =>
	node.value !== undefined
		? decode(node.value)
		: node.type === 'linkReference'
			? `[${(node.children ?? []).map(text).join('')}]`
			: (node.children ?? []).map(text).join('');

/** `hast-util-heading-rank`: 1 to 6 for a heading element, otherwise undefined. */
export const headingRank = (node: HastNode) =>
	node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')
		? Number(node.tagName![1])
		: undefined;

/** `hast-util-to-string`, with the characters mdsvex escaped read back. */
export const hastText = (node: HastNode): string =>
	node.type === 'text' ? decode(node.value ?? '') : (node.children ?? []).map(hastText).join('');

const hasLink = (node: HastNode): boolean =>
	node.tagName === 'a' || (node.children ?? []).some(hasLink);

const isLinked = (depth: number) => depth === 2 || depth === 3;

const element = (tagName: string, className: string, children: HastNode[], href?: string) => ({
	type: 'element',
	tagName,
	properties: { ...(href && { href }), className: [className] },
	children
});

/**
 * Base UI's `rehypeQuickNav` and its MDX `Heading`. h2 and h3 link to themselves, a
 * `data-heading-badge` renders as a badge, and the h2 and h3 become `metadata.toc`. A heading marked
 * `data-exclude-toc` stays out of the toc with its subheadings.
 */
export function headings() {
	return (tree: HastNode, file: { data: { fm?: Record<string, unknown> } }) => {
		const toc: TocItem[] = [];
		let excluded: number | undefined;
		const visit = (node: HastNode) => {
			const depth = headingRank(node);
			if (!depth) return node.children?.forEach(visit);
			const properties = node.properties!;
			const href = `#${properties.id}`;
			if (excluded !== undefined && depth <= excluded) excluded = undefined;
			if (excluded === undefined && 'data-exclude-toc' in properties) excluded = depth;
			if (excluded === undefined && isLinked(depth))
				toc.push({ title: hastText(node), url: href, depth });

			const badge = properties['data-heading-badge'];
			delete properties['data-heading-badge'];
			const children = [
				...(node.children ?? []),
				...(badge
					? [element('span', 'MdHeadingBadge', [{ type: 'text', value: String(badge) }])]
					: [])
			];
			// A link cannot contain a link, so a heading that already has one keeps its id without the self link.
			node.children =
				isLinked(depth) && !hasLink(node)
					? [element('a', 'HeadingLink', children, href)]
					: children;
		};
		visit(tree);
		file.data.fm = { ...file.data.fm, toc };
	};
}

const CLASSES: Record<string, string> = {
	paragraph: 'MdP',
	list: 'MdUl',
	listItem: 'MdListItem',
	emphasis: 'MdEm',
	link: 'Link',
	inlineCode: 'Code MdCode'
};

/** Gives prose elements the classes Base UI's MDX components give them. */
export function elements() {
	const visit = (node: MdNode) => {
		const name =
			node.type === 'list' && (node as { ordered?: boolean }).ordered
				? 'MdOl'
				: node.type === 'heading'
					? `MdH${node.depth}`
					: CLASSES[node.type];
		const existing = node.data?.hProperties as Record<string, unknown> | undefined;
		if (name)
			node.data = {
				...node.data,
				hProperties: {
					...existing,
					class: [name, existing?.class].filter(Boolean).join(' ')
				}
			};
		node.children?.forEach(visit);
	};
	return (tree: MdNode) => visit(tree);
}
