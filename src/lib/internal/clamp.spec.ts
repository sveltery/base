import { describe, expect, it } from 'vitest';
import { clamp } from './clamp.js';

describe('clamp', () => {
	it('returns the value when it is inside the range', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(0, 0, 10)).toBe(0);
		expect(clamp(10, 0, 10)).toBe(10);
	});

	it('limits values outside the range', () => {
		expect(clamp(-1, 0, 10)).toBe(0);
		expect(clamp(11, 0, 10)).toBe(10);
		expect(clamp(Infinity, 0, 10)).toBe(10);
		expect(clamp(-Infinity, 0, 10)).toBe(0);
	});

	it('uses safe-integer bounds when min and max are omitted', () => {
		expect(clamp(3)).toBe(3);
		expect(clamp(1e16)).toBe(Number.MAX_SAFE_INTEGER);
		expect(clamp(-1e16)).toBe(Number.MIN_SAFE_INTEGER);
	});

	it('propagates NaN', () => {
		expect(clamp(Number.NaN, 0, 10)).toBeNaN();
	});
});
