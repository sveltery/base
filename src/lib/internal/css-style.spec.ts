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
		expect(toCssStyle({ '--offset': 0, flexGrow: 0, gridRow: 0, padding: 0 })).toBe(
			'--offset: 0; flex-grow: 0; grid-row: 0; padding: 0px'
		);
	});

	it('keeps unitless zeros unitless and still prints a length zero as 0px', () => {
		expect(toCssStyle({ zIndex: 0, opacity: 0, margin: 0 })).toBe(
			'z-index: 0; opacity: 0; margin: 0px'
		);
	});

	it('joins a base style with an override and keeps the base when the override is empty', () => {
		expect(mergeCssStyle('color: red', 'width: 1px')).toBe('color: red; width: 1px');
		expect(mergeCssStyle('color: red', undefined)).toBe('color: red');
		expect(mergeCssStyle(undefined, undefined)).toBeUndefined();
	});
});
