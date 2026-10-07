import { describe, expect, it } from 'vitest';
import { activationDirection } from './direction.js';

describe('activationDirection', () => {
	it('uses horizontal positions', () => {
		expect(activationDirection(0, 1, 'horizontal', 0, 40)).toBe('right');
		expect(activationDirection(1, 0, 'horizontal', 40, 0)).toBe('left');
		expect(activationDirection(0, 1, 'horizontal', 10, 10)).toBe('none');
	});

	it('uses vertical positions', () => {
		expect(activationDirection(0, 1, 'vertical', 0, 20)).toBe('down');
		expect(activationDirection(1, 0, 'vertical', 20, 0)).toBe('up');
	});

	it('returns none when either value is null', () => {
		expect(activationDirection(null, 1, 'horizontal', 0, 10)).toBe('none');
		expect(activationDirection(0, null, 'horizontal', 0, 10)).toBe('none');
	});

	it('compares values when only one element position is missing', () => {
		expect(activationDirection(0, 2, 'horizontal', null, null)).toBe('none');
		expect(activationDirection(0, 2, 'horizontal', null, 8)).toBe('right');
		expect(activationDirection('b', 'a', 'vertical', 4, null)).toBe('up');
		expect(activationDirection({ id: 1 }, { id: 2 }, 'horizontal', null, 1)).toBe('none');
	});
});
