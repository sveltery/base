export const cases = [
	'plain',
	'labelled',
	'bound',
	'disabled',
	'invalid',
	'required',
	'values'
] as const;
export type InputCase = (typeof cases)[number];
