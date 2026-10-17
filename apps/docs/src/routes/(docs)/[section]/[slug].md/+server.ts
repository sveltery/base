import { error } from '@sveltejs/kit';
import { pages } from 'virtual:docs-markdown';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	Object.keys(pages).map((href) => {
		const [, section, slug] = href.split('/');
		return { section, slug };
	});

export const GET: RequestHandler = ({ params }) => {
	const page = pages[`/${params.section}/${params.slug}`];
	if (!page) error(404, 'Page not found');
	return new Response(page, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
};
