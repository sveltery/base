import { cases, type ToggleGroupCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'exclusive';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as ToggleGroupCase)
			: 'exclusive',
		reference: url.searchParams.has('reference')
	};
}
