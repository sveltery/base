import { files } from 'virtual:docs-markdown';

export const prerender = true;

export const GET = () =>
	new Response(files['index.md'], { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
