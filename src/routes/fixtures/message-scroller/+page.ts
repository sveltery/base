import { cases, type MessageScrollerCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'end';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as MessageScrollerCase)
			: 'end',
		reference: url.searchParams.has('reference')
	};
}
