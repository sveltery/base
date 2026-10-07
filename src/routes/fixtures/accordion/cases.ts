export const cases = [
	'exclusive',
	'multiple',
	'disabled',
	'cancel',
	'bound',
	'prevented',
	'mounted',
	'open',
	'search'
] as const;

export type AccordionCase = (typeof cases)[number];
