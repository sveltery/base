import { cases, type CSPProviderCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'outside';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as CSPProviderCase)
			: 'outside',
		reference: url.searchParams.has('reference')
	};
}
