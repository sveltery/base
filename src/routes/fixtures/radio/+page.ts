import { cases, type RadioCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'checked';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as RadioCase)
			: 'checked',
		reference: url.searchParams.has('reference')
	};
}
