export const cases = [
	'plain',
	'labelled',
	'range',
	'bound',
	'disabled',
	'vertical',
	'edge'
] as const;
export type SliderCase = (typeof cases)[number];
