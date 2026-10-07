export const cases = [
	'exclusive',
	'multiple',
	'vertical',
	'rtl',
	'keyboard',
	'disabled',
	'cancel',
	'bound'
] as const;

export type ToggleGroupCase = (typeof cases)[number];
