import { files } from 'virtual:docs-markdown';

export const prerender = true;

export const GET = () =>
	new Response(files['llms.txt'], { headers: { 'content-type': 'text/plain; charset=utf-8' } });
