export const cases = [
	'plain',
	'multiple',
	'form',
	'reset',
	'disabled',
	'readonly',
	'aligned'
] as const;
export type SelectCase = (typeof cases)[number];

export const fruits = { apple: 'Apple', banana: 'Banana', cherry: 'Cherry' };
