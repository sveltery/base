import { cases, type ScrollAreaCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'both';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as ScrollAreaCase)
			: 'both',
		reference: url.searchParams.has('reference')
	};
}
