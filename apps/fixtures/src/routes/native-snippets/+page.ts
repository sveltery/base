import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => ({
  buttonOutro: url.searchParams.get('case') === 'button-outro',
});
