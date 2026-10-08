import { cases, type OverlayFoundationCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'modal';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as OverlayFoundationCase)
			: 'modal',
		reference: url.searchParams.has('reference')
	};
}
