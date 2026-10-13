import { cases, type ToastCase } from './cases.js';

export function load({ url }: { url: URL }) {
	const requested = url.searchParams.get('case') ?? 'basic';
	return {
		scenario: (cases as readonly string[]).includes(requested) ? (requested as ToastCase) : 'basic',
		reference: url.searchParams.has('reference')
	};
}
