import { cases, type SelectCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'plain';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as SelectCase)
			: 'plain',
		reference: url.searchParams.has('reference')
	};
}
