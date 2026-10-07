import { cases, type OTPFieldCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'plain';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as OTPFieldCase)
			: 'plain',
		reference: url.searchParams.has('reference')
	};
}
