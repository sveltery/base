export const cases = [
	'standalone',
	'close-delay',
	'focus',
	'bound',
	'cancel',
	'safe',
	'detached',
	'payload'
] as const;

export type PreviewCardCase = (typeof cases)[number];
