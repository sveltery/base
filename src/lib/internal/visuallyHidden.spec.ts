import { describe, expect, it } from 'vitest';
import { visuallyHidden, visuallyHiddenInput } from './visuallyHidden.js';

describe('visuallyHidden', () => {
	it('hides content while keeping it available to screen readers', () => {
		expect(visuallyHidden).toEqual({
			clipPath: 'inset(50%)',
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			border: 0,
			padding: 0,
			width: '1px',
			height: '1px',
			margin: '-1px',
			position: 'fixed',
			top: 0,
			left: 0
		});
	});

	it('uses an absolute position for a hidden input', () => {
		expect(visuallyHiddenInput).toEqual({
			clipPath: 'inset(50%)',
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			border: 0,
			padding: 0,
			width: '1px',
			height: '1px',
			margin: '-1px',
			position: 'absolute'
		});
	});

	it('gives nonzero lengths a unit a native style attribute can use', () => {
		expect(visuallyHidden.width).toBe('1px');
		expect(visuallyHidden.height).toBe('1px');
		expect(visuallyHidden.margin).toBe('-1px');
		expect(visuallyHiddenInput.width).toBe('1px');
	});
});
