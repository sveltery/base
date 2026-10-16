import type { TocItem } from '../../../markdown/headings.ts';
import type { Sections } from '../../../markdown/metadata.ts';

export type { Sections, TocItem };

/** What the markdown pipeline exports as a page's `metadata`. */
export type PageMetadata = {
	title: string;
	/** Plain text from `<Meta name="description">`, for the meta tag. */
	description: string;
	/** The `<Subtitle>` as markdown. */
	subtitle: string;
	sections: Sections;
	toc: TocItem[];
};

export type DocPage = { href: string; title: string; description: string };

export type NavSection = { title: string; pages: DocPage[] };
