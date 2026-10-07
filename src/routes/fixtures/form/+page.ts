import { cases, type FormCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'default';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as FormCase)
			: 'default',
		reference: url.searchParams.has('reference')
	};
}
