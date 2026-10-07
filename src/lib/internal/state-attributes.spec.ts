import { describe, expect, it } from 'vitest';
import { getStateAttributesProps } from './state-attributes.js';

describe('getStateAttributesProps', () => {
	it('maps true to an empty data attribute and omits false', () => {
		expect(getStateAttributesProps({ pressed: true, disabled: false })).toEqual({
			'data-pressed': ''
		});
	});

	it('stringifies other truthy values and lowercases the key', () => {
		expect(getStateAttributesProps({ orientation: 'vertical', tabIndex: 0 })).toEqual({
			'data-orientation': 'vertical'
		});
	});

	it('uses a custom mapping when given', () => {
		expect(
			getStateAttributesProps(
				{ pressed: true },
				{ pressed: (value) => (value ? { 'data-state': 'on' } : null) }
			)
		).toEqual({ 'data-state': 'on' });
	});
});
