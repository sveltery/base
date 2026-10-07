import { cases, type CheckboxGroupCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'select';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as CheckboxGroupCase)
			: 'select',
		reference: url.searchParams.has('reference')
	};
}
