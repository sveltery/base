import { readFileSync } from 'node:fs';
import { compile } from 'mdsvex';
import type { Plugin } from 'vite';
import type { ApiPart } from './api.ts';
import { headings, text } from './headings.ts';
import { metadata } from './metadata.ts';
import { pageFiles } from './pages.ts';
import { pageStub, shortName } from './types.ts';

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
type ApiTag = { part: ApiPart; id: string };

const ID = 'virtual:search-documents';
const RESOLVED = `\0${ID}`;

const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1);

/** Serves every docs page, heading and API part as `virtual:search-documents`. */
export function searchDocuments({ routes, lib }: { routes: string; lib: string }): Plugin {
	return {
		name: 'search-documents',
		resolveId: (id) => (id === ID ? RESOLVED : undefined),
		async load(id) {
			if (id !== RESOLVED) return;
			const documents: SearchDocument[] = [];
			for (const { section, slug, path } of pageFiles(routes)) {
				this.addWatchFile(path);
				documents.push(...(await pageDocuments(path, section, slug, lib)));
			}
			return `export const documents = ${JSON.stringify(documents)};`;
		}
	};
}

/** Flattens one page the way upstream's `defaultFlattenPage` does, with `excludeSections`. */
async function pageDocuments(
	file: string,
	folder: string,
	slug: string,
	lib: string
): Promise<SearchDocument[]> {
	const source = readFileSync(file, 'utf8');
	const stub = pageStub(file, lib);
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
			for (const [, tag] of node.value.matchAll(/<(Types[\w.]+)\s*\/>/g)) {
				const part = stub?.tags.get(tag);
				if (part) tags.push({ part, id });
			}
		}
	};
	const compiled = await compile(source, {
		smartypants: false,
		remarkPlugins: [metadata, headings, collect],
		highlight: { highlighter: async () => '' }
	});
	const { title, description } = compiled?.data?.fm as { title: string; description: string };

	const sectionTitle = capitalize(folder);
	const url = `/${folder}/${slug}`;
	const base = { description, sectionTitle };
	const documents: SearchDocument[] = [
		{ ...base, type: 'page', group: `${sectionTitle} Pages`, page: title, title, slug, url }
	];

	const types: string[] = [];
	for (const { part, id } of tags) {
		const short = shortName(part.name);
		types.push(`${part.name}.Props`, `${part.name}.State`);
		const props = part.props.map((prop) => prop.name).join(' ');
		const partUrl = `${url}#${id}`;
		documents.push(
			part.name.includes('.')
				? {
						...base,
						type: 'part',
						group: 'API Reference',
						part: short,
						export: `${slug}.${short}`,
						slug: short.toLowerCase(),
						title: `${title} ‣ ${short}`,
						props,
						url: partUrl
					}
				: {
						...base,
						type: 'export',
						group: 'API Reference',
						export: short.toLowerCase() === slug ? 'api-reference' : short.toLowerCase(),
						slug,
						title: short,
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
