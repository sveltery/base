export const cases = [
	'labelled',
	'described',
	'required',
	'disabled',
	'invalid',
	'values'
] as const;
export type FieldCase = (typeof cases)[number];
