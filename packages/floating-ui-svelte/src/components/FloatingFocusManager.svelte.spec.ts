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

		it('returns focus to a target set in the same update as the close', async () => {
			const { component } = render(PortalFocusHarness);
			flushSync(() => component.show('mouse'));
			await expect.poll(focusedTestId).toBe('inside');

			flushSync(() => component.hide(page.getByTestId('after').element() as HTMLElement));

			await expect.poll(focusedTestId).toBe('after');
		});
	});

	describe('return focus after a close', () => {
		it('reads a return decision that depends on the close reason after the close', async () => {
			const { component } = render(PortalFocusHarness, { returnUnlessOutsidePress: true });
			flushSync(() => component.show('mouse'));
			await expect.poll(focusedTestId).toBe('inside');

			const press = new PointerEvent('pointerdown', { pointerType: 'mouse' });
			flushSync(() => component.close('outside-press', press));

			await expect.poll(() => document.activeElement).toBe(document.body);
			await new Promise((resolve) => requestAnimationFrame(resolve));
			expect(document.activeElement).toBe(document.body);
		});

		it('puts focus back on the trigger when a press blurs it to the body after the popup unmounts on close', async () => {
			const { component } = render(PortalFocusHarness);
			flushSync(() => component.show('mouse'));
			await expect.poll(focusedTestId).toBe('inside');
			const reference = page.getByTestId('reference').element() as HTMLElement;

			// A sloppy outside press closes on pointerdown, before its mousedown.
			const press = new PointerEvent('pointerdown', { pointerType: 'mouse' });
			flushSync(() => component.close('outside-press', press));
			for (let i = 0; i < 5; i += 1) await Promise.resolve();
			expect(document.activeElement).toBe(reference);
			// The compatibility mousedown on a non-focusable target moves focus to the body.
			reference.blur();

			await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
			expect(document.activeElement).toBe(reference);
		});

		it('returns focus to the trigger when the popup unmounts inside an iframe', async () => {
			const iframe = document.createElement('iframe');
			document.body.appendChild(iframe);
			try {
				const frameDocument = iframe.contentDocument!;
				const { component } = render(PortalFocusHarness, {
					target: frameDocument.body,
					props: { container: frameDocument.body }
				});
				flushSync(() => component.show('mouse'));
				const focused = () => frameDocument.activeElement?.getAttribute('data-testid') ?? null;
				await expect.poll(focused).toBe('inside');

				flushSync(() => component.hide());

				await expect.poll(focused).toBe('reference');
			} finally {
				iframe.remove();
			}
		});

		it('keeps focus in a closed popup until it unmounts, then returns it to the trigger', async () => {
			const { component } = render(PortalFocusHarness, { keepMounted: true });
			flushSync(() => component.show('mouse'));
			await expect.poll(focusedTestId).toBe('inside');

			// A sloppy outside press closes on pointerdown, before its mousedown.
			const press = new PointerEvent('pointerdown', { pointerType: 'mouse' });
			flushSync(() => component.close('outside-press', press));
			await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
			expect(focusedTestId()).toBe('inside');
			// The compatibility mousedown on a non-focusable target moves focus to the body.
			(page.getByTestId('inside').element() as HTMLElement).blur();
			flushSync(() => component.unmount());

			await expect.poll(focusedTestId).toBe('reference');
		});

		it('returns focus after a focus-out close from a Shift+Tab inside a modal popup', async () => {
			const { component } = render(PortalFocusHarness, { modal: true });
			flushSync(() => component.show('keyboard'));
			await expect.poll(focusedTestId).toBe('inside');

			const shiftTab = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
			flushSync(() => component.close('focus-out', shiftTab));

			await expect.poll(focusedTestId).toBe('reference');
		});

		it('does not return focus after a focus-out close from a focus guard', async () => {
			const { component } = render(PortalFocusHarness);
			flushSync(() => component.show('keyboard'));
			await expect.poll(focusedTestId).toBe('inside');
			const guard = document.createElement('span');
			guard.setAttribute('data-base-ui-focus-guard', '');

			flushSync(() => component.close('focus-out', new FocusEvent('focus'), guard));

			await expect.poll(() => document.activeElement).toBe(document.body);
			await new Promise((resolve) => requestAnimationFrame(resolve));
			expect(document.activeElement).toBe(document.body);
		});
	});

	describe('initial focus', () => {
		it('focuses the popup inside a positioner when nothing inside is tabbable', async () => {
			const { component } = render(PortalFocusHarness, { wrapped: true });

			flushSync(() => component.show('mouse'));

			await expect.poll(focusedTestId).toBe('popup');
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
