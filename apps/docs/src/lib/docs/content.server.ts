import type { DocPage, NavSection, PageMetadata, TocItem } from './types';

/** Sidebar sections, in order. A page's section is its folder under `src/routes/(docs)`. */
const SECTIONS: Record<string, string> = {
	overview: 'Overview',
	handbook: 'Handbook',
	components: 'Components',
	utils: 'Utils'
};

/** Each section's pages in nav order, until the section index pages list them. Unlisted pages follow by title. */
const ORDER: Record<string, string[]> = {
	overview: ['quick-start', 'accessibility', 'releases', 'community', 'about'],
	handbook: [
		'styling',
		'animation',
		'composition',
		'customization',
		'forms',
		'typescript',
		'sveltekit'
	],
	utils: ['csp-provider', 'direction-provider', 'merge-props']
};

/** Shorter side nav titles, such as "About" for "About Sveltery Base". */
const NAV_TITLES: Record<string, string> = { '/overview/about': 'About' };

const metadata = import.meta.glob<PageMetadata>('/src/routes/\\(docs\\)/*/*/+page.md', {
	eager: true,
	import: 'metadata'
});

type Entry = DocPage & { section: string; order: number; heading: string; toc: TocItem[] };

const entries: Entry[] = Object.entries(metadata).map(([file, page]) => {
	const [section, slug] = file.split('/').slice(-3, -1);
	if (!(section in SECTIONS))
		throw new Error(`${file}: folder "${section}" is not a section in content.server.ts`);
	const href = `/${section}/${slug}`;
	const order = ORDER[section]?.indexOf(slug) ?? -1;
	return {
		href,
		title: NAV_TITLES[href] ?? page.title,
		description: page.subtitle,
		section,
		order: order === -1 ? Infinity : order,
		heading: page.title,
		toc: page.toc
	};
});

/** A section's pages by `order`, then title. */
const sectionEntries = (id: string) =>
	entries
		.filter((entry) => entry.section === id)
		.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

/** The sidebar. */
export const nav: NavSection[] = Object.entries(SECTIONS).map(([id, title]) => ({
	title,
	pages: sectionEntries(id).map(({ href, title, description }) => ({ href, title, description }))
}));

export const sectionIds = Object.keys(SECTIONS);

/** A section's index page lists its pages with their full titles and outlines, as Base UI's does. */
export function sectionIndex(id: string) {
	if (!(id in SECTIONS)) return undefined;
	return {
		id,
		title: SECTIONS[id],
		pages: sectionEntries(id).map(({ href, heading, description, toc }) => ({
			href,
			title: heading,
			description,
			toc
		}))
	};
}
