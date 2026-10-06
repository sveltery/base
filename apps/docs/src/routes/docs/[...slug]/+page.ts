import { error } from '@sveltejs/kit';
import { docs } from '../../../../../fixtures/src/lib/docs/content.js';
import type { EntryGenerator, PageLoad } from './$types';
export const entries: EntryGenerator = () =>
  docs.filter((doc) => doc.slug).map((doc) => ({ slug: doc.slug }));
export const load: PageLoad = ({ params }) => {
  const doc = docs.find((item) => item.slug === params.slug.replace(/\/$/, ''));
  if (!doc) error(404, 'Documentation page not found');
  return { doc };
};
