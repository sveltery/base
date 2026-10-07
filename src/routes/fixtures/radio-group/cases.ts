export const cases = [
	'select',
	'initial',
	'keyboard',
	'rtl',
	'disabled',
	'readonly',
	'cancel',
	'bound',
	'required',
	'legend'
] as const;

export type RadioGroupCase = (typeof cases)[number];
