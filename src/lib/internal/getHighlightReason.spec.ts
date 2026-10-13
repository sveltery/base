import { describe, expect, it } from 'vitest';
import { getHighlightReason } from './getHighlightReason.js';

describe('getHighlightReason', () => {
	it('maps the event type to the highlight reason', () => {
		const reasons = [
			undefined,
			new Event('keydown'),
			new Event('mousemove'),
			new Event('pointerleave'),
			new Event('focus')
		].map(getHighlightReason);

		expect(reasons).toEqual(['none', 'keyboard', 'pointer', 'pointer', 'none']);
	});
});
