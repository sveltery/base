import { text, type MdNode } from './headings.ts';
import { inlineMarkdown, plainText } from './reference.ts';

/** The headings below a page's title, nested by depth and keyed by slug. */
export type Sections = Record<string, { title: string; children: Sections }>;

const SUBTITLE = /^<Subtitle>([\s\S]*)<\/Subtitle>$/;
const META = /^<Meta\s+name="([^"]+)"\s+content="([^"]*)"\s*\/>$/;

// Upstream's slugs for the sections tree, which differ from heading ids.
const slugify = (value: string) =>
	value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

/**
 * Base UI's `transformMarkdownMetadata`. The first h1 is the `title`, `<Meta name="description">`
 * the `description`, falling back to the subtitle, and the h2 and deeper headings the `sections`.
 * `<Meta>` renders nothing, and as in upstream's MDX components, a description over 170 characters
 * fails the build. The subtitle's inline markdown becomes HTML, as MDX parses it in upstream.
 */
export function metadata() {
	return (tree: MdNode, file: { filename?: string; data: { fm?: Record<string, unknown> } }) => {
		const nodes = tree.children ?? [];
		const h1 = nodes.findIndex((node) => node.type === 'heading' && node.depth === 1);
		if (h1 === -1) throw new Error(`${file.filename}: a page starts with a "# Title" heading`);
		const title = text(nodes[h1]);

		let subtitle: string | undefined;
		const next = nodes[h1 + 1];
		const wrapped = next?.type === 'html' ? SUBTITLE.exec(next.value!.trim()) : null;
		if (wrapped) {
			subtitle = wrapped[1].replace(/\s+/g, ' ').trim();
			next.value = `<Subtitle>${inlineMarkdown(subtitle)}</Subtitle>`;
		} else if (next?.type === 'paragraph') subtitle = text(next).replace(/\s+/g, ' ').trim();

		let description: string | undefined;
		const sections: Sections = {};
		const stack: { depth: number; children: Sections }[] = [{ depth: 1, children: sections }];
		for (const node of nodes.slice(h1 + 1)) {
			const meta = node.type === 'html' ? META.exec(node.value!.trim()) : null;
			if (meta) {
				if (meta[1] === 'description') description = meta[2];
				node.value = '';
			}
			if (node.type !== 'heading' || !node.depth || node.depth < 2) continue;
			while (stack.at(-1)!.depth >= node.depth) stack.pop();
			const heading = { title: text(node), children: {} };
			stack.at(-1)!.children[slugify(heading.title)] = heading;
			stack.push({ depth: node.depth, children: heading.children });
		}

		if (description && description.length > 170)
			throw new Error(`${file.filename}: the <Meta> description is longer than 170 characters`);

		file.data.fm = {
			...file.data.fm,
			title,
			description: description ?? plainText(subtitle ?? ''),
			subtitle: subtitle ?? '',
			sections
		};
	};
}
