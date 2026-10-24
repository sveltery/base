import { cases, type ResizableCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'horizontal';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as ResizableCase)
			: 'horizontal',
		reference: url.searchParams.has('reference')
	};
}
