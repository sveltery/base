import { cases, type DrawerCase } from './cases.js';

export function load({ url }: { url: URL }) {
	const requested = url.searchParams.get('case') ?? 'standalone';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as DrawerCase)
			: 'standalone',
		reference: url.searchParams.has('reference')
	};
}
