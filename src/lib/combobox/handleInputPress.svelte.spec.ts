// Assertions follow Base UI v1.9.0 packages/react/src/combobox/utils/handleInputPress.test.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { describe, expect, it, vi } from 'vitest';
import { handleInputPress } from './dom.js';
import type { ComboboxStore } from './store.svelte.js';

describe('handleInputPress', () => {
	it('handles an event whose target is not an Element', () => {
		const focus = vi.fn();
		const store = {
			root: { openOnInputClick: false },
			inputElement: { focus }
		} as unknown as ComboboxStore;
		const container = document.createElement('div');
		const text = document.createTextNode('padding');
		container.append(text);
		let event: MouseEvent | undefined;
		container.addEventListener('mousedown', (pressed) => {
			event = pressed;
			handleInputPress(pressed, store, false);
		});

		text.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));

		expect(event?.defaultPrevented).toBe(true);
		expect(focus).toHaveBeenCalledOnce();
	});
});
