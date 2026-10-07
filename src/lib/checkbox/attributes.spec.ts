import { describe, expect, it } from 'vitest';
import { checkboxIndicatorAttributes, checkboxRootAttributes } from './attributes.js';
import type { CheckboxRootState } from './types.js';

const unticked: CheckboxRootState = {
	checked: false,
	disabled: false,
	readOnly: false,
	required: false,
	indeterminate: false
};

describe('checkboxRootAttributes', () => {
	it('marks an unticked checkbox', () => {
		expect(checkboxRootAttributes(unticked)).toEqual({ 'data-unchecked': '' });
	});

	it('marks a ticked checkbox', () => {
		expect(checkboxRootAttributes({ ...unticked, checked: true })).toEqual({ 'data-checked': '' });
	});

	it('omits checked hooks while indeterminate', () => {
		expect(checkboxRootAttributes({ ...unticked, checked: true, indeterminate: true })).toEqual({
			'data-indeterminate': ''
		});
	});

	it('keeps disabled, readonly, and required beside indeterminate', () => {
		expect(
			checkboxRootAttributes({
				checked: false,
				disabled: true,
				readOnly: true,
				required: true,
				indeterminate: true
			})
		).toEqual({
			'data-disabled': '',
			'data-readonly': '',
			'data-required': '',
			'data-indeterminate': ''
		});
	});
});

describe('checkboxIndicatorAttributes', () => {
	it('adds the starting style hook', () => {
		expect(
			checkboxIndicatorAttributes({ ...unticked, checked: true, transitionStatus: 'starting' })
		).toEqual({
			'data-checked': '',
			'data-starting-style': ''
		});
	});

	it('adds the ending style hook and still omits checked hooks while indeterminate', () => {
		expect(
			checkboxIndicatorAttributes({
				...unticked,
				indeterminate: true,
				transitionStatus: 'ending'
			})
		).toEqual({
			'data-indeterminate': '',
			'data-ending-style': ''
		});
	});
});
