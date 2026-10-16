import type { SitemapPage, SitemapSectionData } from '../../../markdown/sitemap.ts';

export type Badge = 'Preview' | 'New';

const DISPLAY_TITLES: Record<string, string> = { 'About Sveltery Base': 'About' };

/** Upstream's `getDisplayTitle`: the shorter side nav title some pages have. */
export const getDisplayTitle = (title: string) => DISPLAY_TITLES[title] ?? title;

/** Upstream's `getSitemapPageInfo`: a page's URL, whether it leaves the docs, and its nav badges. */
export function getSitemapPageInfo(section: SitemapSectionData, page: SitemapPage) {
	const preview = page.tags?.includes('Preview') ?? false;
	const badges: Badge[] = preview ? ['Preview'] : page.tags?.includes('New') ? ['New'] : [];
	return {
		badges,
		external: page.tags?.includes('External') ?? false,
		href: page.path.startsWith('./')
			? `${section.prefix}${page.path.slice(2).replace(/\/\+page\.md$/, '')}`
			: page.path
	};
}
