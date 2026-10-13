import { cases, type AlertDialogCase } from './cases.js';

export function load({ url }: { url: URL }) {
	const requested = url.searchParams.get('case') ?? 'standalone';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as AlertDialogCase)
			: 'standalone',
		reference: url.searchParams.has('reference')
	};
}
