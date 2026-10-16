import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import type { Sections } from './metadata.ts';
import {
	indexFiles,
	kebabToTitle,
	parsePageIndex,
	syncPageIndex,
	type IndexPage
} from './page-index.ts';

/** A page as the sitemap lists it: upstream's `SitemapPage`, without the outline's markdown. */
export type SitemapPage = Omit<IndexPage, 'sections'> & { sections?: SitemapSections };
export type SitemapSections = Record<string, { title: string; children?: SitemapSections }>;

/** One section index: upstream's `SitemapSectionData`. */
export type SitemapSectionData = { title: string; prefix: string; pages: SitemapPage[] };

/** Upstream's `Sitemap`: the search schema and every section, keyed by its side nav heading. */
export type Sitemap = {
	schema: Record<string, 'string'>;
	data: Record<string, SitemapSectionData>;
};

const ID = 'virtual:sitemap';
const RESOLVED = `\0${ID}`;

// The fields of a search document, as upstream's `createSitemapSchema` gives Orama.
const SCHEMA = Object.fromEntries(
	[
		'type',
		'group',
		'title',
		'description',
		'slug',
		'sectionTitle',
		'page',
		'part',
		'export',
		'props',
		'types',
		'section',
		'subsection'
	].map((key) => [key, 'string' as const])
);

const stripMarkdown = (sections: Sections): SitemapSections =>
	Object.fromEntries(
		Object.entries(sections).map(([slug, { title, children }]) => [
			slug,
			Object.keys(children).length ? { title, children: stripMarkdown(children) } : { title }
		])
	);

/** Upstream's `loadServerPageIndex`: one section index as sitemap data, its prefix and title from its path. */
function sectionData(routes: string, section: string): SitemapSectionData {
	const { pages } = parsePageIndex(readFileSync(join(routes, section, '+page.md'), 'utf8'));
	return {
		title: kebabToTitle(section),
		prefix: `/${section}/`,
		pages: pages.map(({ sections, ...page }) =>
			sections ? { ...page, sections: stripMarkdown(sections) } : page
		)
	};
}

/**
 * Upstream's `createSitemap` and `loadPrecomputedSitemap`. Serves `virtual:sitemap`, built from
 * the section index pages, as `sitemap = { schema, data }`. `sections` maps each side nav heading
 * to its folder under `routes`, in order, as upstream's `app/sitemap/index.ts` does.
 *
 * Like upstream's `extractToIndex`, a build or a dev server first regenerates every index from
 * its child pages, and the dev server again whenever a child page changes.
 */
export function sitemap({
	routes,
	lib,
	sections
}: {
	routes: string;
	lib: string;
	sections: Record<string, string>;
}): Plugin {
	const sync = (file: string) => syncPageIndex(file, { routes, lib });
	return {
		name: 'sitemap',
		async buildStart() {
			for (const { file } of indexFiles(routes)) await sync(file);
		},
		resolveId: (id) => (id === ID ? RESOLVED : undefined),
		load(id) {
			if (id !== RESOLVED) return;
			const data: Sitemap['data'] = {};
			for (const [name, section] of Object.entries(sections)) {
				this.addWatchFile(join(routes, section, '+page.md'));
				data[name] = sectionData(routes, section);
			}
			return `export const sitemap = ${JSON.stringify({ schema: SCHEMA, data } satisfies Sitemap)};`;
		},
		async handleHotUpdate({ file, server }) {
			if (!file.startsWith(routes) || !file.endsWith('/+page.md')) return;
			const index = indexFiles(routes).find(
				({ file: index }) => join(file, '../..', '+page.md') === index
			);
			// The nav comes from the root layout's data, so a changed index reloads every open page.
			if (index && (await sync(index.file))) server.ws.send({ type: 'full-reload' });
		}
	};
}
