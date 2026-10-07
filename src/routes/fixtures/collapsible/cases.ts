export const cases = [
	'standalone',
	'bound',
	'cancel',
	'disabled',
	'prevented',
	'mounted',
	'open',
	'search'
] as const;
export type CollapsibleCase = (typeof cases)[number];
