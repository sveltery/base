import pages from 'virtual:docs-markdown';
import { nav } from '#lib/docs/content.server.ts';
import { SITE } from '#lib/docs/links.ts';

export const prerender = true;

export const GET = () => {
	const sections = nav.map(({ title, pages: entries }) =>
		[
			`## ${title}`,
			'',
			...entries.map(({ href }) => {
				const page = pages[href];
				return `- [${page.title}](${SITE}${href}.md): ${page.description}`;
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
