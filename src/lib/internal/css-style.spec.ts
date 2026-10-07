import { describe, expect, it } from 'vitest';
import { mergeCssStyle, toCssStyle } from './css-style.js';

describe('css-style', () => {
	it('prints length zeros as 0px and keeps custom properties', () => {
		expect(
			toCssStyle({
				insetInlineStart: 0,
				zIndex: undefined,
				'--position': '10%',
				visibility: ''
			})
		).toBe('inset-inline-start: 0px; --position: 10%');
	});

	it('joins a base style with an override and keeps the base when the override is empty', () => {
		expect(mergeCssStyle('color: red', 'width: 1px')).toBe('color: red; width: 1px');
		expect(mergeCssStyle('color: red', undefined)).toBe('color: red');
		expect(mergeCssStyle(undefined, undefined)).toBeUndefined();
	});
});
