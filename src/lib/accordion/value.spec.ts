import { describe, expect, it } from 'vitest';
import { nextAccordionValue } from './value.js';

describe('nextAccordionValue', () => {
	it('opens one item and replaces the previous one when multiple is false', () => {
		expect(nextAccordionValue([], 'a', true, false)).toEqual(['a']);
		expect(nextAccordionValue(['a'], 'b', true, false)).toEqual(['b']);
		expect(nextAccordionValue([0], 1, true, false)).toEqual([1]);
	});

	it('closes the open item when it is the first value', () => {
		expect(nextAccordionValue(['a'], 'a', false, false)).toEqual([]);
		expect(nextAccordionValue([0], 0, false, false)).toEqual([]);
	});

	it('clears an exclusive item even when nextOpen stays true', () => {
		expect(nextAccordionValue(['a'], 'a', true, false)).toEqual([]);
	});

	it('pushes and removes items independently when multiple is true', () => {
		expect(nextAccordionValue(['a'], 'b', true, true)).toEqual(['a', 'b']);
		expect(nextAccordionValue(['two'], 'one', true, true)).toEqual(['two', 'one']);
		expect(nextAccordionValue(['a', 'b'], 'a', false, true)).toEqual(['b']);
		expect(nextAccordionValue([0, 1], 0, false, true)).toEqual([1]);
	});

	it('pushes a duplicate when an already open item asks to open', () => {
		expect(nextAccordionValue(['a'], 'a', true, true)).toEqual(['a', 'a']);
	});
});
