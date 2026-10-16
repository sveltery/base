import { error } from '@sveltejs/kit';
import { sectionIds, sectionIndex } from '#lib/docs/content.server.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => sectionIds.map((section) => ({ section }));

export const load: PageServerLoad = ({ params }) => {
	const section = sectionIndex(params.section);
	if (!section) error(404, 'Page not found');
	return { section };
};
