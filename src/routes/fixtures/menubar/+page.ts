import { cases, type MenubarCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'basic';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as MenubarCase)
			: 'basic',
		reference: url.searchParams.has('reference')
	};
}
