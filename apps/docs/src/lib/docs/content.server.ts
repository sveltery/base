import type { DocPage, Frontmatter, NavSection, TocItem } from './types';

/** Sidebar sections, in order. A page's section is its folder under `content`. */
const SECTIONS: Record<string, string> = {
	overview: 'Overview',
	handbook: 'Handbook',
	components: 'Components',
	utils: 'Utils'
};

const metadata = import.meta.glob<Frontmatter>(['/content/*/*.md'], {
	eager: true,
	import: 'metadata'
});

type Entry = DocPage & { section: string; order: number; heading: string; toc: TocItem[] };

const entries: Entry[] = Object.entries(metadata).map(([file, fm]) => {
	const [section, slug] = file
		.replace(/^\/content\//, '')
		.replace(/\.md$/, '')
		.split('/');
	if (!(section in SECTIONS))
		throw new Error(`${file}: folder "${section}" is not a section in content.server.ts`);
	if (!fm?.title || !fm.description)
		throw new Error(`${file}: frontmatter needs a title and a description`);
	return {
		href: `/${section}/${slug}`,
		title: fm.navTitle ?? fm.title,
		description: fm.description,
		section,
		order: fm.order ?? Infinity,
		heading: fm.title,
		toc: fm.toc
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
		title: SECTIONS[id],
		pages: sectionEntries(id).map(({ href, heading, description, toc }) => ({
			href,
			title: heading,
			description,
			toc
		}))
	};
}
