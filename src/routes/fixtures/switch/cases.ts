export const cases = [
	'standalone',
	'bound',
	'cancel',
	'disabled',
	'readonly',
	'label',
	'form',
	'native',
	'prevented'
] as const;
export type SwitchCase = (typeof cases)[number];
