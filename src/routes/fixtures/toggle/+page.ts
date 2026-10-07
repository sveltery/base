import { cases, type ToggleCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'uncontrolled';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as ToggleCase)
			: 'uncontrolled',
		reference: url.searchParams.has('reference')
	};
}
