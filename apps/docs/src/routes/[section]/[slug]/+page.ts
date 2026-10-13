import { error } from '@sveltejs/kit';
import type { DocModule } from '#lib/docs/types.ts';
import type { EntryGenerator, PageLoad } from './$types';

const modules = import.meta.glob<DocModule>('/content/*/*.md');

export const entries: EntryGenerator = () =>
	Object.keys(modules).map((path) => {
		const [section, slug] = path
			.replace(/^\/content\//, '')
			.replace(/\.md$/, '')
			.split('/');
		return { section, slug };
	});

export const load: PageLoad = async ({ params }) => {
	const module = modules[`/content/${params.section}/${params.slug}.md`];
	if (!module) error(404, 'Page not found');
	const { default: content, metadata } = await module();
	return { content, metadata };
};
