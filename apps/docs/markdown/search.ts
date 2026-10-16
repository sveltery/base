import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { compile } from 'mdsvex';
import type { Plugin } from 'vite';
import { apiReference } from './api.ts';
import { headings } from './headings.ts';
import { shortName } from './preprocess.ts';

/** One search result. The fields match the index schema of upstream's `useSearch`. */
export type SearchDocument = {
	type: 'page' | 'part' | 'export' | 'section' | 'subsection';
	group: string;
	title: string;
	description: string;
	slug: string;
	sectionTitle: string;
	page?: string;
	part?: string;
	export?: string;
	props?: string;
	types?: string;
	section?: string;
	subsection?: string;
	url: string;
};

type MdNode = {
	type: string;
	depth?: number;
	value?: string;
	children?: MdNode[];
	data?: { hProperties?: { id?: string } };
};

type Heading = { title: string; id: string; depth: number };
type ApiTag = { name: string; part: string; id: string };

const ID = 'virtual:search-documents';
const RESOLVED = `\0${ID}`;

// mdsvex escapes code before remark plugins run.
const decode = (value: string) =>
	value.replace(/&(lt|gt|#123|#125|amp);/g, (_, entity: string) => DECODED[entity]);
const DECODED: Record<string, string> = { lt: '<', gt: '>', '#123': '{', '#125': '}', amp: '&' };
const text = (node: MdNode): string =>
	node.value !== undefined ? decode(node.value) : (node.children ?? []).map(text).join('');
const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1);

/** Serves every page, heading and API part under `content` as `virtual:search-documents`. */
export function searchDocuments({ pages, lib }: { pages: string; lib: string }): Plugin {
	return {
		name: 'search-documents',
		resolveId: (id) => (id === ID ? RESOLVED : undefined),
		async load(id) {
			if (id !== RESOLVED) return;
			const documents: SearchDocument[] = [];
			for (const folder of readdirSync(pages)) {
				for (const name of readdirSync(join(pages, folder)).filter((file) =>
					file.endsWith('.md')
				)) {
					const file = join(pages, folder, name);
					this.addWatchFile(file);
					documents.push(
						...(await pageDocuments(
							readFileSync(file, 'utf8'),
							folder,
							name.replace(/\.md$/, ''),
							lib
						))
					);
				}
			}
			return `export const documents = ${JSON.stringify(documents)};`;
		}
	};
}

/** Flattens one page the way upstream's `defaultFlattenPage` does, with `excludeSections`. */
async function pageDocuments(
	source: string,
	folder: string,
	slug: string,
	lib: string
): Promise<SearchDocument[]> {
	const found: Heading[] = [];
	const tags: ApiTag[] = [];
	const collect = () => (tree: MdNode) => {
		let id = '';
		for (const node of tree.children ?? []) {
			if (node.type === 'heading' && node.depth && node.depth <= 4) {
				id = node.data?.hProperties?.id ?? '';
				found.push({ title: text(node), id, depth: node.depth });
			}
			if (node.type !== 'html' || !node.value) continue;
			for (const [, attrs] of node.value.matchAll(/<ApiPart\b([^>]*?)\s*\/>/g)) {
				const name = /\bname="([^"]+)"/.exec(attrs)?.[1];
				const part = /\bpart="([^"]+)"/.exec(attrs)?.[1];
				if (name && part) tags.push({ name, part, id });
			}
		}
	};
	const compiled = await compile(source, {
		smartypants: false,
		remarkPlugins: [headings, collect],
		highlight: { highlighter: async () => '' }
	});
	const { title, description } = compiled?.data?.fm as { title: string; description: string };

	const sectionTitle = capitalize(folder);
	const url = `/${folder}/${slug}`;
	const base = { description, sectionTitle };
	const documents: SearchDocument[] = [
		{ ...base, type: 'page', group: `${sectionTitle} Pages`, page: title, title, slug, url }
	];

	const references = new Map<string, ReturnType<typeof apiReference>>();
	const types: string[] = [];
	for (const tag of tags) {
		if (!references.has(tag.name)) references.set(tag.name, apiReference(lib, tag.name));
		const part = references.get(tag.name)!.find((entry) => shortName(entry.name) === tag.part);
		if (part) types.push(`${part.name}.Props`, `${part.name}.State`);
		const props = part?.props.map((prop) => prop.name).join(' ') ?? '';
		const partUrl = `${url}#${tag.id}`;
		documents.push(
			part?.name.includes('.')
				? {
						...base,
						type: 'part',
						group: 'API Reference',
						part: tag.part,
						export: `${slug}.${tag.part}`,
						slug: tag.part.toLowerCase(),
						title: `${title} ‣ ${tag.part}`,
						props,
						url: partUrl
					}
				: {
						...base,
						type: 'export',
						group: 'API Reference',
						export: tag.part.toLowerCase() === slug ? 'api-reference' : tag.part.toLowerCase(),
						slug,
						title: tag.part,
						props,
						url: partUrl
					}
		);
	}

	if (types.length) documents[0].types = types.join(' ');

	// Each heading's breadcrumb starts at its h2.
	const trail: Heading[] = [];
	for (const heading of found.filter((entry) => entry.depth >= 2)) {
		trail.splice(heading.depth - 2);
		trail.push(heading);
		const path = trail.map((entry) => entry.title).join(' ‣ ');
		documents.push({
			...base,
			type: heading.depth === 2 ? 'section' : 'subsection',
			group: 'Sections',
			[heading.depth === 2 ? 'section' : 'subsection']: path,
			slug: `${slug}#${heading.id}`,
			title: `${title} ‣ ${path}`,
			url: `${url}#${heading.id}`
		});
	}
	return documents;
}
