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
	'readonly',
	'virtualized'
] as const;
export type ComboboxCase = (typeof cases)[number];

export const fruits = ['Apple', 'Banana', 'Cherry'];

/** A long list of which the `virtualized` case renders the first `windowSize` matches. */
export const manyItems = Array.from({ length: 20 }, (_, index) => `Item ${index}`);
export const windowSize = 5;

export const gridRows = [
	['Red', 'Green', 'Blue'],
	['Cyan', 'Magenta', 'Yellow']
];
