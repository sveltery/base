import { flushSync } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { OpenInteractionType } from '@sveltery/utils';
import PortalFocusHarness from './__tests__/PortalFocusHarness.svelte';

function focusedTestId() {
	return document.activeElement?.getAttribute('data-testid') ?? null;
}

describe('FloatingFocusManager', () => {
	describe('return focus', () => {
		it.each([
			[null, 'before'],
			['mouse', 'reference'],
			['keyboard', 'reference']
		] as const)(
			'after an open with interaction type %s returns focus to %s',
			async (method: OpenInteractionType | null, expected) => {
				const { component } = render(PortalFocusHarness);
				page.getByTestId('before').element().focus();

				flushSync(() => component.show(method));
				await expect.poll(focusedTestId).toBe('inside');

				flushSync(() => component.hide());
				await expect.poll(focusedTestId).toBe(expected);
			}
		);

		it('falls back to the trigger when the element focused before open is gone', async () => {
			const { component } = render(PortalFocusHarness);
			const before = page.getByTestId('before').element() as HTMLElement;
			before.focus();

			flushSync(() => component.show(null));
			await expect.poll(focusedTestId).toBe('inside');
			before.remove();

			flushSync(() => component.hide());
			await expect.poll(focusedTestId).toBe('reference');
		});
	});

	describe('non-modal portaled popup', () => {
		const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

		it('stays open when focus leaves it without an outside press', async () => {
			const { component } = render(PortalFocusHarness);
			flushSync(() => component.show('mouse'));
			await expect.poll(focusedTestId).toBe('inside');

			(page.getByTestId('after').element() as HTMLElement).focus();
			await wait(20);

			expect(component.store.open).toBe(true);
		});

		it('closes when an outside press moves focus out of it', async () => {
			const { component } = render(PortalFocusHarness);
			flushSync(() => component.show('mouse'));
			await expect.poll(focusedTestId).toBe('inside');

			const after = page.getByTestId('after').element() as HTMLElement;
			after.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }));
			after.focus();

			await expect.poll(() => component.store.open).toBe(false);
			expect(component.store.lastReason).toBe('focus-out');
		});
	});
});
