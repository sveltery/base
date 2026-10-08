export const cases = [
	'standalone',
	'bound',
	'cancel',
	'disabled',
	'prevented',
	'hover',
	'modal',
	'close',
	'open',
	'detached'
] as const;

export type PopoverCase = (typeof cases)[number];
