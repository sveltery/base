import { sitemap } from 'virtual:sitemap';
import { getDisplayTitle, getSitemapPageInfo } from './sitemap.ts';
import type { NavSection } from './types';

/** The side nav and mobile nav: each section index's list, as upstream's docs layout reads the sitemap. */
export const nav: NavSection[] = Object.entries(sitemap.data).map(([title, section]) => ({
	title,
	pages: section.pages.map((page) => ({
		...getSitemapPageInfo(section, page),
		title: getDisplayTitle(page.title)
	}))
}));
