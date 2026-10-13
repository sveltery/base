import { describe, expect, it } from 'vitest';
import { normalizeScrollOffset } from './scrollEdges.js';

describe('normalizeScrollOffset', () => {
	it('returns 0 when there is nothing to scroll', () => {
		expect(normalizeScrollOffset(12, 0)).toBe(0);
		expect(normalizeScrollOffset(-4, -1)).toBe(0);
	});

	it('snaps offsets inside the 1px edge tolerance', () => {
		expect(normalizeScrollOffset(0.4, 100)).toBe(0);
		expect(normalizeScrollOffset(1, 100)).toBe(0);
		expect(normalizeScrollOffset(99, 100)).toBe(100);
		expect(normalizeScrollOffset(99.2, 100)).toBe(100);
	});

	it('keeps a short range on the nearer edge when both tolerances match', () => {
		expect(normalizeScrollOffset(0.2, 1)).toBe(0);
		expect(normalizeScrollOffset(0.8, 1)).toBe(1);
	});

	it('clamps values outside the range and keeps the middle', () => {
		expect(normalizeScrollOffset(-10, 100)).toBe(0);
		expect(normalizeScrollOffset(140, 100)).toBe(100);
		expect(normalizeScrollOffset(40, 100)).toBe(40);
	});
});
