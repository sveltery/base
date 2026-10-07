import { describe, expect, it } from 'vitest';
import { valueToPercent } from './valueToPercent.js';

describe('valueToPercent', () => {
	it('maps a value onto the 0–100 range of min and max', () => {
		expect(valueToPercent(0, 0, 100)).toBe(0);
		expect(valueToPercent(50, 0, 100)).toBe(50);
		expect(valueToPercent(100, 0, 100)).toBe(100);
		expect(valueToPercent(15, 10, 20)).toBe(50);
		expect(valueToPercent(25, 0, 200)).toBe(12.5);
	});

	it('does not clamp values outside min and max', () => {
		expect(valueToPercent(0, 50, 100)).toBe(-100);
		expect(valueToPercent(150, 0, 100)).toBe(150);
	});

	it('follows division when min and max are equal', () => {
		expect(valueToPercent(5, 5, 5)).toBeNaN();
		expect(valueToPercent(6, 5, 5)).toBe(Infinity);
		expect(valueToPercent(4, 5, 5)).toBe(-Infinity);
	});
});
