import { cases, type AccordionCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'exclusive';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as AccordionCase)
			: 'exclusive',
		reference: url.searchParams.has('reference')
	};
}
