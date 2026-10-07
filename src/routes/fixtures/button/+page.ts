import { cases, type ButtonCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'native';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as ButtonCase)
			: 'native',
		reference: url.searchParams.has('reference')
	};
}
