export const cases = [
	'standalone',
	'bound',
	'cancel',
	'disabled',
	'readonly',
	'label',
	'form',
	'native',
	'prevented',
	'indeterminate',
	'enter'
] as const;
export type CheckboxCase = (typeof cases)[number];
