import { cases, type MeterCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'basic';
	return {
		scenario: (cases as readonly string[]).includes(requested) ? (requested as MeterCase) : 'basic',
		reference: url.searchParams.has('reference')
	};
}
