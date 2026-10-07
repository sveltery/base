import { cases, type AvatarCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'loaded';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as AvatarCase)
			: 'loaded',
		reference: url.searchParams.has('reference')
	};
}
