import { describe, expect, it } from 'vitest';
import { radioIndicatorAttributes, radioRootAttributes } from './attributes.js';
import type { RadioRootState } from './types.js';

const off: RadioRootState = {
	checked: false,
	disabled: false,
	readOnly: false,
	required: false
};

describe('radioRootAttributes', () => {
	it('marks an unchecked radio', () => {
		expect(radioRootAttributes(off)).toEqual({ 'data-unchecked': '' });
	});

	it('marks a checked radio', () => {
		expect(radioRootAttributes({ ...off, checked: true })).toEqual({ 'data-checked': '' });
	});

	it('keeps disabled, readonly, and required beside the checked hook', () => {
		expect(
			radioRootAttributes({
				checked: true,
				disabled: true,
				readOnly: true,
				required: true
			})
		).toEqual({
			'data-checked': '',
			'data-disabled': '',
			'data-readonly': '',
			'data-required': ''
		});
	});
});

describe('radioIndicatorAttributes', () => {
	it('adds the starting style hook', () => {
		expect(
			radioIndicatorAttributes({ ...off, checked: true, transitionStatus: 'starting' })
		).toEqual({
			'data-checked': '',
			'data-starting-style': ''
		});
	});

	it('adds the ending style hook', () => {
		expect(radioIndicatorAttributes({ ...off, transitionStatus: 'ending' })).toEqual({
			'data-unchecked': '',
			'data-ending-style': ''
		});
	});
});
