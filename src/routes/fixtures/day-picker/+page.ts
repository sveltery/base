import { cases, type DayPickerCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'single';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as DayPickerCase)
			: 'single',
		reference: url.searchParams.has('reference')
	};
}
