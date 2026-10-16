import type { Component } from 'svelte';
import type { TocItem } from '../../../markdown/headings.ts';

export type { TocItem };

/** Frontmatter every page in `content` declares, plus the `toc` the markdown pipeline adds. */
export type Frontmatter = {
	title: string;
	description: string;
	/** A shorter title for the side nav, such as "About" for "About Sveltery Base". */
	navTitle?: string;
	order?: number;
	toc: TocItem[];
};

export type DocModule = { default: Component; metadata: Frontmatter };

export type DocPage = { href: string; title: string; description: string };

export type NavSection = { title: string; pages: DocPage[] };
