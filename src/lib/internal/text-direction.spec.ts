import { describe, expect, it } from 'vitest';
import { elementTextDirection } from './text-direction.js';

describe('elementTextDirection', () => {
	it('reads rtl from the computed style and treats a missing element as ltr', () => {
		const element = {} as Element;
		const original = globalThis.getComputedStyle;
		globalThis.getComputedStyle = () => ({ direction: 'rtl' }) as CSSStyleDeclaration;
		try {
			expect(elementTextDirection(element)).toBe('rtl');
			expect(elementTextDirection(null)).toBe('ltr');
		} finally {
			globalThis.getComputedStyle = original;
		}
	});
});
