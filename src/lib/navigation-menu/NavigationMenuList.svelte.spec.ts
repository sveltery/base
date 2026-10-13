// Assertions follow Base UI v1.9.0 packages/react/src/navigation-menu/list/NavigationMenuList.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NavigationMenuListHarness from '../../tests/NavigationMenuListHarness.svelte';
import { byId } from '../../tests/previewCardEvents.js';

function keyDown(element: Element, key: string) {
	element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('NavigationMenu.List', () => {
	it('stops vertical navigation keys from escaping the list', () => {
		const handleKeyDown = vi.fn();
		render(NavigationMenuListHarness, { orientation: 'vertical', onOuterKeyDown: handleKeyDown });

		const trigger = byId('first')!;
		trigger.focus();
		keyDown(trigger, 'ArrowUp');
		keyDown(trigger, 'ArrowDown');

		expect(handleKeyDown.mock.calls.length).toBe(0);

		keyDown(trigger, 'PageDown');

		expect(handleKeyDown.mock.calls.length).toBe(1);
	});

	describe('item removal', () => {
		it('navigates from the focused trigger after an earlier item is removed', async () => {
			const screen = render(NavigationMenuListHarness, { showFirst: true });

			const first = byId('first')!;
			first.focus();

			keyDown(first, 'ArrowRight');
			await tick();

			const middle = byId('middle')!;
			expect(document.activeElement).toBe(middle);
			keyDown(middle, 'ArrowRight');
			await tick();

			const last = byId('last')!;
			expect(document.activeElement).toBe(last);

			await screen.rerender({ showFirst: false });

			keyDown(last, 'ArrowLeft');
			await tick();

			expect(document.activeElement).toBe(middle);
		});
	});
});
