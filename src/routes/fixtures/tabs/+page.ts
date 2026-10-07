import { cases, type TabsCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'select';
	return {
		scenario: (cases as readonly string[]).includes(requested) ? (requested as TabsCase) : 'select',
		reference: url.searchParams.has('reference')
	};
}
