import { cases, type DialogCase } from './cases.js';

export function load({ url }: { url: URL }) {
	const requested = url.searchParams.get('case') ?? 'standalone';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as DialogCase)
			: 'standalone',
		reference: url.searchParams.has('reference')
	};
}
