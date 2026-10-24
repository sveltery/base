export const cases = ['end', 'start', 'last-anchor', 'auto-scroll', 'empty'] as const;
export type MessageScrollerCase = (typeof cases)[number];

export type FixtureMessage = { id: string; height: number; scrollAnchor?: boolean };

const rows = (...heights: number[]): FixtureMessage[] =>
	heights.map((height, index) => ({ id: `message-${index + 1}`, height }));

export const initialMessages: Record<MessageScrollerCase, FixtureMessage[]> = {
	end: rows(80, 80, 80),
	start: rows(80, 80, 80),
	'last-anchor': [
		{ id: 'message-1', height: 100 },
		{ id: 'message-2', height: 40, scrollAnchor: true },
		{ id: 'message-3', height: 160 }
	],
	'auto-scroll': rows(80, 80, 80),
	empty: []
};

export const appended = (count: number): FixtureMessage[] => [
	{ id: `message-${count + 1}`, height: 40, scrollAnchor: true },
	{ id: `message-${count + 2}`, height: 200 }
];

export const viewportStyle = 'height: 100px; overflow-y: auto';
