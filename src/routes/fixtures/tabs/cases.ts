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
	'loop',
	'prehydrate'
] as const;

export type TabsCase = (typeof cases)[number];
