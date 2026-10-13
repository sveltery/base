import { cases, type MenuCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'basic';
	return {
		scenario: (cases as readonly string[]).includes(requested) ? (requested as MenuCase) : 'basic',
		reference: url.searchParams.has('reference')
	};
}
