// Fixture for the Combobox port of Base UI v1.9.0
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { cases, type ComboboxCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'plain';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as ComboboxCase)
			: 'plain',
		reference: url.searchParams.has('reference')
	};
}
