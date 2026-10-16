import pages from 'virtual:docs-markdown';
import { sitemap } from 'virtual:sitemap';
import { getSitemapPageInfo } from '#lib/docs/sitemap.ts';
import { SITE } from '#lib/docs/links.ts';
import { plainText } from '../../../markdown/reference.ts';

export const prerender = true;

export const GET = () => {
	const sections = Object.entries(sitemap.data).map(([title, section]) =>
		[
			`## ${title}`,
			'',
			...section.pages.flatMap((entry) => {
				const { href, external } = getSitemapPageInfo(section, entry);
				if (external) return [];
				return `- [${pages[href].title}](${SITE}${href}.md): ${plainText(pages[href].description)}`;
			})
		].join('\n')
	);
	const body = [
		'# Sveltery Base',
		'',
		'This is the documentation for the `@sveltery/base` package, a Svelte 5 port of Base UI.',
		'It contains a collection of components and utilities for building user interfaces in Svelte.',
		'The library is designed to be composable and styling agnostic.',
		'The Tailwind CSS examples are written for Tailwind CSS v4.',
		'',
		sections.join('\n\n'),
		''
	].join('\n');
	return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
