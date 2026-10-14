// Fixture cases for the Combobox port of Base UI v1.9.0
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
export const cases = [
	'plain',
	'multiple',
	'popup-input',
	'grid',
	'form',
	'reset',
	'disabled',
	'readonly'
] as const;
export type ComboboxCase = (typeof cases)[number];

export const fruits = ['Apple', 'Banana', 'Cherry'];

export const gridRows = [
	['Red', 'Green', 'Blue'],
	['Cyan', 'Magenta', 'Yellow']
];
