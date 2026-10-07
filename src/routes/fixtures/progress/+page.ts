import { cases, type ProgressCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'determinate';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as ProgressCase)
			: 'determinate',
		reference: url.searchParams.has('reference')
	};
}
