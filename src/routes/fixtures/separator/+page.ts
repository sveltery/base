import { cases, type SeparatorCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'horizontal';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as SeparatorCase)
			: 'horizontal',
		reference: url.searchParams.has('reference')
	};
}
