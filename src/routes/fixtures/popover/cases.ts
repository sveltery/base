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
	'detached',
	'tab',
	'tab-empty',
	'tab-inline',
	'tab-ext',
	'tab-between-ext'
] as const;

export type PopoverCase = (typeof cases)[number];
