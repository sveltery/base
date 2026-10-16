import type { NavSection } from '#lib/docs/types.ts';
import type { SearchDocument } from '../../../../markdown/search.ts';

export type { SearchDocument };
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
	sectionTitle: 50,
	section: 3,
	subsection: 2.5,
	props: 1.5
};
const SCHEMA = {
	type: 'string',
	group: 'string',
	title: 'string',
	description: 'string',
	slug: 'string',
	sectionTitle: 'string',
	page: 'string',
	part: 'string',
	export: 'string',
	props: 'string',
	section: 'string',
	subsection: 'string'
} as const;
// Words that carry meaning in docs, such as the "for" of `htmlFor`, stay searchable.
const KEPT_STOPWORDS = new Set(
	'about but for between before after above below once then where to from up down in out on off over under'.split(
		' '
	)
);

type Index = { orama: unknown; documents: SearchDocument[] };

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
	const [{ create, insertMultiple }, { pluginQPS }, { stopwords }, { documents }] =
		await Promise.all([
			import('@orama/orama'),
			import('@orama/plugin-qps'),
			import('@orama/stopwords/english'),
			import('virtual:search-documents')
		]);
	const orama = create({
		schema: SCHEMA,
		components: {
			tokenizer: {
				stemming: true,
				language: 'english',
				stemmerSkipProperties: ['type', 'group', 'slug', 'sectionTitle', 'page', 'part', 'export', 'props'],
				stopWords: stopwords.filter((word) => !KEPT_STOPWORDS.has(word))
			}
		},
		plugins: [pluginQPS()]
	});
	// QPS only keeps statistics for properties that hold data, so one empty document fills them all.
	const empty = Object.fromEntries(Object.keys(SCHEMA).map((key) => [key, '']));
	await insertMultiple(orama, [empty, ...documents] as never[]);
	return { orama, documents };
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

	#nav: () => NavSection[];
	#latest = 0;
	#timeout: ReturnType<typeof setTimeout> | undefined;

	constructor(nav: () => NavSection[]) {
		this.#nav = nav;
	}

	get hasQuery() {
		return this.value.trim() !== '';
	}

	get empty() {
		return this.hasQuery && this.ready && !this.pending && this.results.length === 0;
	}

	/** Loads the index, then shows every page if nothing was typed meanwhile. */
	async activate() {
		if (this.ready) return;
		const loaded = await loadSearchIndex();
		const pages = new Map(
			loaded.documents.filter((doc) => doc.type === 'page').map((doc) => [doc.url, doc])
		);
		this.defaults = this.#nav().map((section) => ({
			group: `${section.title} Pages`,
			items: section.pages.flatMap((page) => pages.get(page.href) ?? [])
		}));
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

	/** Clears the query, and the results after `delay` so a closing popup keeps its content. */
	reset(delay = 0) {
		this.value = '';
		this.pending = false;
		this.#latest++;
		clearTimeout(this.#timeout);
		this.#timeout = setTimeout(() => (this.results = this.defaults), delay);
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
