export const cases = [
	'checked',
	'unchecked',
	'disabled',
	'readonly',
	'label',
	'native',
	'required',
	'enter',
	'null',
	'bubble',
	'stop'
] as const;
export type RadioCase = (typeof cases)[number];
