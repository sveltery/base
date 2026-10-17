import type { ApiSummary } from '../../../../markdown/page-index.ts';
import type {
	Sitemap,
	SitemapPage,
	SitemapSectionData,
	SitemapSections
} from '../../../../markdown/sitemap.ts';
import { libraryHeadingId } from '../../../../markdown/concat-headings.ts';
import { stripHeadingTag } from '../../../../markdown/heading-tags.ts';
import { stringToUrl } from '../../../../markdown/slug.ts';
import { getSitemapPageInfo } from '#lib/docs/sitemap.ts';

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
	dataAttributes?: string;
	cssVariables?: string;
	types?: string;
	section?: string;
	subsection?: string;
	url: string;
};
export type SearchGroup = { group: string; items: SearchDocument[] };

// Upstream's `useSearch` defaults, from @mui/internal-docs-infra.
const BOOST = {
	type: 100,
	group: 100,
	slug: 2,
	title: 2,
	page: 10,
	description: 1.5,
	part: 1.5,
	export: 1.3,
	types: 2,
	sectionTitle: 50,
	section: 3,
	subsection: 2.5,
	props: 1.5,
	dataAttributes: 1.5,
	cssVariables: 1.5
};
// Words that carry meaning in docs, such as the "for" of `htmlFor`, stay searchable.
const KEPT_STOPWORDS = new Set(
	'about but for between before after above below once then where to from up down in out on off over under'.split(
		' '
	)
);

type Index = { orama: unknown; defaults: SearchGroup[] };

/**
 * The ids the page gives its headings, in document order, as `slug.ts` assigns them after the h1's:
 * a repeated title gets a numbered id, and a Forms library's h3 its library's name.
 */
function headingIds(sections: SitemapSections, page: string) {
	const used: Record<string, true> = { [stringToUrl(page)]: true };
	const ids: [SitemapSections[string], string][] = [];
	const visit = (level: SitemapSections, depth: number, parent?: string) => {
		for (const heading of Object.values(level)) {
			const title = stripHeadingTag(heading.title);
			const base = stringToUrl(title);
			let id = base;
			for (let count = 1; id in used; count++) id = `${base}-${count}`;
			used[id] = true;
			ids.push([heading, (depth === 3 && parent && libraryHeadingId(page, parent, title)) || id]);
			if (heading.children) visit(heading.children, depth + 1, depth === 2 ? title : parent);
		}
	};
	visit(sections, 2);
	return new Map(ids);
}

/** A part's or an export's props, data attributes and CSS variables, each as one searchable string. */
const apiFields = (api: ApiSummary) => ({
	props: api.props?.join(' ') ?? '',
	dataAttributes: api.dataAttributes?.join(' ') ?? '',
	cssVariables: api.cssVariables?.join(' ') ?? ''
});

/**
 * Upstream's `defaultFlattenPage`, with `includeCategoryInGroup` and `excludeSections`: a page, its
 * API parts and exports, and each of its headings. Each result links to the heading's real id, and
 * a part or an export to the last heading with its name.
 */
function flattenPage(page: SitemapPage, section: SitemapSectionData): SearchDocument[] {
	const { href } = getSitemapPageInfo(section, page);
	const title = page.title;
	const base = { description: page.description ?? '', sectionTitle: section.title };
	const ids = headingIds(page.sections ?? {}, title);
	const idOf = new Map([...ids].map(([heading, id]) => [heading.title, id]));
	const documents: SearchDocument[] = [
		{
			...base,
			type: 'page',
			group: `${section.title} Pages`,
			page: title,
			title,
			slug: page.slug,
			url: href,
			...(page.types?.length ? { types: page.types.join(' ') } : {})
		}
	];
	for (const [part, api] of Object.entries(page.parts ?? {}))
		documents.push({
			...base,
			type: 'part',
			group: 'API Reference',
			part,
			export: `${page.slug}.${part}`,
			slug: part.toLowerCase(),
			title: `${title} ‣ ${part}`,
			...apiFields(api),
			url: `${href}#${idOf.get(part) ?? part.toLowerCase()}`
		});
	for (const [name, api] of Object.entries(page.exports ?? {})) {
		const id = idOf.get(name) ?? 'api-reference';
		documents.push({
			...base,
			type: 'export',
			group: 'API Reference',
			export: id,
			slug: page.slug,
			title: name,
			...apiFields(api),
			url: `${href}#${id}`
		});
	}
	const visit = (sections: SitemapSections, trail: string[]): void => {
		for (const heading of Object.values(sections)) {
			const path = [...trail, heading.title];
			const type = trail.length ? 'subsection' : 'section';
			const id = ids.get(heading);
			if (id)
				documents.push({
					...base,
					type,
					group: 'Sections',
					[type]: path.join(' ‣ '),
					slug: `${page.slug}#${id}`,
					title: `${title} ‣ ${path.join(' ‣ ')}`,
					url: `${href}#${id}`
				});
			if (heading.children) visit(heading.children, path);
		}
	};
	visit(page.sections ?? {}, []);
	return documents;
}

let index: Promise<Index> | undefined;

/** Builds the search index once, on first use. */
export function loadSearchIndex(): Promise<Index> {
	index ??= build().catch((error) => {
		index = undefined;
		throw error;
	});
	return index;
}

async function build(): Promise<Index> {
	const [{ create, insertMultiple }, { pluginQPS }, { stopwords }, { sitemap }] = await Promise.all(
		[
			import('@orama/orama'),
			import('@orama/plugin-qps'),
			import('@orama/stopwords/english'),
			import('virtual:sitemap') as Promise<{ sitemap: Sitemap }>
		]
	);
	const orama = create({
		schema: sitemap.schema,
		components: {
			tokenizer: {
				stemming: true,
				language: 'english',
				stemmerSkipProperties: [
					'type',
					'group',
					'slug',
					'sectionTitle',
					'page',
					'part',
					'export',
					'props',
					'dataAttributes',
					'cssVariables'
				],
				stopWords: stopwords.filter((word) => !KEPT_STOPWORDS.has(word))
			}
		},
		plugins: [pluginQPS()]
	});
	// Each page's first document is the page itself. With no query, those show, grouped by section.
	const documents: SearchDocument[] = [];
	const defaults: SearchGroup[] = [];
	for (const section of Object.values(sitemap.data)) {
		const pages = section.pages.map((page) => flattenPage(page, section));
		documents.push(...pages.flat());
		defaults.push({ group: `${section.title} Pages`, items: pages.map(([page]) => page) });
	}
	// QPS only keeps statistics for properties that hold data, so one empty document fills them all.
	const empty = Object.fromEntries(Object.keys(sitemap.schema).map((key) => [key, '']));
	await insertMultiple(orama, [empty, ...documents] as never[]);
	return { orama, defaults };
}

/** Upstream's query: grouped, at most five per group, exact and prefix title matches first. */
async function query({ orama }: Index, value: string): Promise<SearchGroup[]> {
	const { search } = await import('@orama/orama');
	const lower = value.toLowerCase();
	const normalized = lower.replace(/[-\s]+/g, ' ').trim();
	const rank = (document: SearchDocument) => {
		const title = document.title.toLowerCase();
		const slug = document.slug.toLowerCase().replace(/-/g, ' ');
		if (title === lower || slug === normalized) return 0;
		if (title.startsWith(lower) || slug.startsWith(normalized)) return 1;
		if (title.includes(lower) || slug.includes(normalized)) return 2;
		return 3;
	};
	const result = await search(orama as never, {
		term: value,
		limit: 20,
		tolerance: 0,
		boost: BOOST,
		groupBy: { properties: ['group'], maxResult: 5 },
		// Past 20 characters upstream relies on the score alone.
		sortBy:
			lower.length <= 20
				? ([, aScore, a], [, bScore, b]) =>
						rank(a as SearchDocument) - rank(b as SearchDocument) || bScore - aScore
				: undefined
	});
	return (result.groups ?? []).map((group) => ({
		group: group.values.join(' '),
		items: group.result.map((hit) => hit.document as unknown as SearchDocument)
	}));
}

/** Upstream drops the " Pages" suffix from a section's group name. */
export const groupLabel = (group: string) => group.replace(/\s+Pages$/, '');

/**
 * The state of one search box. A query shows its results as they arrive. An empty query shows
 * every page, in sidebar order.
 */
export class DocsSearch {
	value = $state('');
	ready = $state(false);
	pending = $state(false);
	/** The groups the list shows. */
	results = $state<SearchGroup[]>([]);
	defaults: SearchGroup[] = [];

	#latest = 0;
	#timeout: ReturnType<typeof setTimeout> | undefined;

	get hasQuery() {
		return this.value.trim() !== '';
	}

	get empty() {
		return this.hasQuery && this.ready && !this.pending && this.results.length === 0;
	}

	/** Loads the index, then shows every page if nothing was typed meanwhile. */
	async activate() {
		if (this.ready) return;
		this.defaults = (await loadSearchIndex()).defaults;
		this.ready = true;
		if (this.hasQuery) await this.search(this.value);
		else this.results = this.defaults;
	}

	async search(value: string) {
		this.value = value;
		const id = ++this.#latest;
		clearTimeout(this.#timeout);
		if (!value.trim()) {
			this.pending = false;
			this.results = this.defaults;
			return;
		}
		this.pending = true;
		if (!this.ready) return;
		const groups = await query(await loadSearchIndex(), value);
		if (id !== this.#latest) return;
		this.pending = false;
		// Waiting before "No results" keeps it from flashing while the user types.
		if (groups.length) this.results = groups;
		else this.#timeout = setTimeout(() => (this.results = groups), 400);
	}

	/** Clears the query and shows every page again. */
	reset() {
		void this.search('');
	}
}

/**
 * Cmd or Ctrl+Enter, or Alt+Enter, opens the highlighted result in a new tab, as upstream does.
 * Returns whether it handled the event.
 */
export function openInNewTab(event: KeyboardEvent, result: SearchDocument | undefined) {
	// `keyCode` 229 marks IME composition in Safari, where `isComposing` is unreliable.
	if (event.isComposing || event.keyCode === 229) return false;
	if (event.key !== 'Enter' || (!event.metaKey && !event.ctrlKey && !event.altKey) || !result) {
		return false;
	}
	event.preventDefault();
	event.stopPropagation();
	window.open(result.url, '_blank', 'noopener,noreferrer');
	return true;
}
