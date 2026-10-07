export const cases = [
	'native',
	'disabled',
	'focusable',
	'custom',
	'custom-disabled',
	'link',
	'prevented'
] as const;
export type ButtonCase = (typeof cases)[number];
