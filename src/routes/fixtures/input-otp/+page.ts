import { cases, type InputOTPCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'base';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as InputOTPCase)
			: 'base',
		reference: url.searchParams.has('reference')
	};
}
