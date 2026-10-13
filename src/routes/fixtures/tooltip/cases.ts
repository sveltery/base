export const cases = [
	'standalone',
	'delay',
	'no-close-on-click',
	'bound',
	'cancel',
	'disabled',
	'provider',
	'unhoverable',
	'detached',
	'cursor'
] as const;

export type TooltipCase = (typeof cases)[number];
