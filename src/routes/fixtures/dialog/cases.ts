export const cases = [
	'standalone',
	'outside',
	'cancel',
	'disabled',
	'nested',
	'nested-open',
	'nested-onto',
	'nested-popover',
	'focus'
] as const;
export type DialogCase = (typeof cases)[number];
