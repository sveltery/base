import { describe, expect, it } from 'vitest';
import {
	applyOverscrollThumb,
	normalizeOverflowEdgeThreshold,
	normalizeScrollOffset,
	pickState
} from './geometry.js';

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

describe('normalizeOverflowEdgeThreshold', () => {
	it('applies one number to every edge and drops negatives', () => {
		expect(normalizeOverflowEdgeThreshold(8)).toEqual({
			xStart: 8,
			xEnd: 8,
			yStart: 8,
			yEnd: 8
		});
		expect(normalizeOverflowEdgeThreshold(-3)).toEqual({
			xStart: 0,
			xEnd: 0,
			yStart: 0,
			yEnd: 0
		});
	});

	it('fills missing edges with 0', () => {
		expect(normalizeOverflowEdgeThreshold({ xStart: 4, yEnd: 2 })).toEqual({
			xStart: 4,
			xEnd: 0,
			yStart: 0,
			yEnd: 2
		});
		expect(normalizeOverflowEdgeThreshold(undefined)).toEqual({
			xStart: 0,
			xEnd: 0,
			yStart: 0,
			yEnd: 0
		});
	});
});

describe('pickState', () => {
	it('returns the previous object when every field matches', () => {
		const prev = { x: true, y: false };
		expect(pickState(prev, { x: true, y: false })).toBe(prev);
	});

	it('returns the next object when a field differs', () => {
		const prev = { x: true, y: false };
		const next = { x: false, y: false };
		expect(pickState(prev, next)).toBe(next);
	});
});

describe('applyOverscrollThumb', () => {
	it('slides in range without a size override', () => {
		expect(applyOverscrollThumb(50, 100, 400, 40, 80)).toEqual({
			offset: 40,
			sizeOverride: ''
		});
	});

	it('shrinks and pins to the end edge while overscrolling', () => {
		const applied = applyOverscrollThumb(120, 100, 400, 40, 80);
		expect(applied.offset).toBeGreaterThan(80);
		expect(applied.sizeOverride.endsWith('px')).toBe(true);
	});

	it('pins to the start edge while overscrolling backward', () => {
		const applied = applyOverscrollThumb(-20, 100, 400, 40, 80);
		expect(applied.offset).toBe(0);
		expect(applied.sizeOverride.endsWith('px')).toBe(true);
	});
});
