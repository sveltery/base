// Ported in part from Base UI v1.9.0 packages/react/src/combobox/utils/parts.test.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The `clickHighlightedItem` cases are covered through the Enter key in the component specs.

import { describe, expect, it } from 'vitest';
import { getChipNavigationKeys, getIndexAfterChipRemoval, isTypedInput } from './parts.js';

describe('Combobox part utilities', () => {
	it('returns no index after removing the only chip', () => {
		expect(getIndexAfterChipRemoval(0, 1)).toBe(undefined);
	});

	it('moves to the previous chip after removing the last one and keeps the index otherwise', () => {
		expect(getIndexAfterChipRemoval(2, 3)).toBe(1);
		expect(getIndexAfterChipRemoval(0, 3)).toBe(0);
	});

	it('swaps the chip keys in right-to-left text', () => {
		expect(getChipNavigationKeys('ltr')).toEqual(['ArrowLeft', 'ArrowRight']);
		expect(getChipNavigationKeys('rtl')).toEqual(['ArrowRight', 'ArrowLeft']);
	});

	it('treats composition commits and typed edits as typing, but not autofill', () => {
		expect(isTypedInput({ type: 'compositionend' } as Event)).toBe(true);
		expect(isTypedInput({ type: 'input', inputType: 'insertText' } as unknown as Event)).toBe(true);
		expect(isTypedInput({ type: 'input', inputType: '' } as unknown as Event)).toBe(false);
		expect(
			isTypedInput({ type: 'input', inputType: 'insertReplacementText' } as unknown as Event)
		).toBe(false);
		expect(isTypedInput({ type: 'input' } as Event)).toBe(false);
	});
});
