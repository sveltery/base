export const cases = [
	'plain',
	'multiple',
	'popup-input',
	'form',
	'reset',
	'disabled',
	'readonly'
] as const;
export type ComboboxCase = (typeof cases)[number];

export const fruits = ['Apple', 'Banana', 'Cherry'];
