// Behavior follows Base UI v1.9.0 packages/react/src/utils/useOpenInteractionType.ts,
// packages/utils/src/useEnhancedClickHandler.ts and packages/react/src/floating-ui-react/hooks/useClick.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { flushSync } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createChangeEventDetails, REASONS } from '@sveltery/utils';
import ClickHarness from './__tests__/ClickHarness.svelte';

function pointerDown(pointerType: string, init: { cancelable?: boolean } = {}) {
	const event = new PointerEvent('pointerdown', { bubbles: true, pointerType, ...init });
	const trigger = page.getByTestId('trigger').element();
	flushSync(() => trigger.dispatchEvent(event));
	return event;
}

describe('ClickInteraction', () => {
	it('records how a closed trigger is pressed on pointerdown', () => {
		const { component } = render(ClickHarness);

		pointerDown('pen');

		expect(component.store.openMethod).toBe('pen');
	});

	it('keeps the open method of an open popup and ignores a prevented press', () => {
		const { component } = render(ClickHarness);
		const { store } = component;
		const trigger = page.getByTestId('trigger').element();
		trigger.addEventListener('pointerdown', (event) => event.preventDefault(), { capture: true });

		pointerDown('touch', { cancelable: true });
		expect(store.openMethod).toBe(null);

		store.openMethod = 'keyboard';
		flushSync(() => store.setOpen(true, createChangeEventDetails(REASONS.triggerPress)));
		pointerDown('mouse');
		expect(store.openMethod).toBe('keyboard');
	});

	describe('mousedown press', () => {
		// Chrome reports a screen reader press as a zero-pressure 1x1 mouse pointerdown.
		function pointerDownAs(virtual: boolean) {
			dispatch(
				new PointerEvent('pointerdown', {
					bubbles: true,
					pointerType: 'mouse',
					width: 1,
					height: 1,
					pressure: virtual ? 0 : 0.5,
					buttons: virtual ? 0 : 1
				})
			);
		}

		function mouseDownAs(virtual: boolean) {
			dispatch(new MouseEvent('mousedown', { bubbles: true, detail: virtual ? 0 : 1 }));
		}

		function dispatch(event: Event) {
			page.getByTestId('trigger').element().dispatchEvent(event);
		}

		function press(virtual: boolean) {
			flushSync(() => {
				pointerDownAs(virtual);
				mouseDownAs(virtual);
			});
		}

		it('opens at once on a screen reader press', () => {
			const { component } = render(ClickHarness, { event: 'mousedown' });

			press(true);

			expect(component.store.open).toBe(true);
		});

		it('closes at once on a later screen reader mousedown after a press with no click', () => {
			const { component } = render(ClickHarness, { event: 'mousedown' });
			press(true);
			expect(component.store.open).toBe(true);

			flushSync(() => mouseDownAs(true));

			expect(component.store.open).toBe(false);
		});

		it('toggles on a screen reader press that another handler already opened', () => {
			const { component } = render(ClickHarness, { event: 'mousedown' });
			const trigger = page.getByTestId('trigger').element();
			const otherHandlerPress = new MouseEvent('mousedown');

			flushSync(() => pointerDownAs(true));
			flushSync(() =>
				component.store.setOpen(
					true,
					createChangeEventDetails(REASONS.triggerPress, otherHandlerPress, trigger)
				)
			);
			flushSync(() => mouseDownAs(true));

			expect(component.store.open).toBe(false);
		});

		it('opens a frame after a mouse press', async () => {
			const { component } = render(ClickHarness, { event: 'mousedown' });

			press(false);

			expect(component.store.open).toBe(false);
			await expect.poll(() => component.store.open).toBe(true);
		});
	});

	it('reports the configured input-press reason in the open change', async () => {
		const { component } = render(ClickHarness, { reason: REASONS.inputPress });

		await page.getByTestId('trigger').click();

		expect(component.store.open).toBe(true);
		expect(component.store.lastReason).toBe('input-press');
	});
});
