export const cases = [
	'standalone',
	'outside',
	'cancel',
	'disabled',
	'nested',
	'nested-open',
	'nested-popover',
	'focus'
] as const;
export type DialogCase = (typeof cases)[number];
