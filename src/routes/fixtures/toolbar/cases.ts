export const cases = [
	'keyboard',
	'vertical',
	'rtl',
	'loop',
	'disabled',
	'focusable',
	'skip',
	'activate',
	'custom'
] as const;

export type ToolbarCase = (typeof cases)[number];
