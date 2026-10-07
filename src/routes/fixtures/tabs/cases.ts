export const cases = [
	'select',
	'keyboard',
	'follow',
	'vertical',
	'rtl',
	'disabled',
	'cancel',
	'bound',
	'fallback',
	'loop'
] as const;

export type TabsCase = (typeof cases)[number];
