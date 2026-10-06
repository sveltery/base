import type { PageLoad } from './$types.js';
export const load: PageLoad = ({ url }) => ({
  native: url.searchParams.has('native'),
  canceled: url.searchParams.has('canceled'),
  scenario: url.searchParams.get('case') ?? 'reassociation',
});
