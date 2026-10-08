export const cases = [
	'standalone',
	'outside',
	'cancel',
	'disabled',
	'nested',
	'nested-open',
	'nested-onto',
	'nested-popover',
	'focus',
	'nested-body',
	'final-focus',
	'child-initial',
	'siblings',
	'kept-child'
] as const;
export type DialogCase = (typeof cases)[number];
