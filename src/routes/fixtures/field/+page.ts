import { cases, type FieldCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'labelled';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as FieldCase)
			: 'labelled',
		reference: url.searchParams.has('reference')
	};
}
