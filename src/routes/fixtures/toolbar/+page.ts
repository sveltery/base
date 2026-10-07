import { cases, type ToolbarCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'keyboard';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as ToolbarCase)
			: 'keyboard',
		reference: url.searchParams.has('reference')
	};
}
