export const cases = [
	'labelled',
	'custom-id',
	'disabled',
	'nested',
	'dynamic',
	'labels',
	'nested-labels'
] as const;
export type FieldsetCase = (typeof cases)[number];
