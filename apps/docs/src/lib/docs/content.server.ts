import type { DocPage, Frontmatter, NavSection } from './types';

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

type Entry = DocPage & { section: string; order: number };

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
		title: fm.title,
		description: fm.description,
		section,
		order: fm.order ?? Infinity
	};
});

/** The sidebar. Each section lists its pages by `order`, then title. */
export const nav: NavSection[] = Object.entries(SECTIONS).map(([id, title]) => ({
	title,
	pages: entries
		.filter((entry) => entry.section === id)
		.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
		.map(({ href, title, description }) => ({ href, title, description }))
}));

/** Every page in reading order, which is also the previous and next order. */
export const pages: DocPage[] = nav.flatMap((section) => section.pages);
