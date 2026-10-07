export const cases = [
	'select',
	'initial',
	'disabled',
	'cancel',
	'bound',
	'parent',
	'form'
] as const;

export type CheckboxGroupCase = (typeof cases)[number];
