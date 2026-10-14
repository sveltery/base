// Behavior follows Base UI v1.9.0
// packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { flushSync } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FocusModesHarness from './__tests__/FocusModesHarness.svelte';

function focusedTestId() {
	return document.activeElement?.getAttribute('data-testid') ?? null;
}

function element(testId: string) {
	return page.getByTestId(testId).element() as HTMLElement;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('FloatingFocusManager', () => {
	describe('getInsideElements', () => {
		it('stays open when focus moves to an inside element and closes when it moves outside', async () => {
			const { component } = render(FocusModesHarness, { modal: false, withInsideElement: true });
			flushSync(() => component.show('keyboard'));
			await expect.poll(focusedTestId).toBe('first');

			element('inside-element').focus();
			await wait(20);
			expect(component.store.open).toBe(true);

			element('first').focus();
			element('after').focus();
			await expect.poll(() => component.store.open).toBe(false);
			expect(component.store.lastReason).toBe('focus-out');
		});

		it('keeps an inside element exposed while a modal popup hides outside content', async () => {
			const { component } = render(FocusModesHarness, { withInsideElement: true });
			flushSync(() => component.show('keyboard'));
			await expect.poll(focusedTestId).toBe('first');

			await expect.element(page.getByTestId('after')).toHaveAttribute('aria-hidden', 'true');
			await expect.element(page.getByTestId('inside-element')).not.toHaveAttribute('aria-hidden');
		});

		it('returns focus to the reference when the popup closes with focus on an inside element', async () => {
			const { component } = render(FocusModesHarness, { withInsideElement: true });
			flushSync(() => component.show('keyboard'));
			await expect.poll(focusedTestId).toBe('first');
			element('inside-element').focus();

			flushSync(() => component.hide());

			await expect.poll(focusedTestId).toBe('reference');
		});
	});

	describe('typeable combobox reference with initialFocus false', () => {
		async function openFromInput(modal = true) {
			const { component } = render(FocusModesHarness, {
				modal,
				combobox: true,
				initialFocus: false,
				controls: 0
			});
			element('reference').focus();
			flushSync(() => component.show('mouse'));
			await expect.poll(() => component.store.open).toBe(true);
			return component;
		}

		it.each([
			['modal', true],
			['non-modal', false]
		])('keeps the input exposed while a %s popup hides outside content', async (_, modal) => {
			await openFromInput(modal);

			await expect.element(page.getByTestId('after')).toHaveAttribute('aria-hidden', 'true');
			await expect.element(page.getByTestId('reference')).not.toHaveAttribute('aria-hidden');
			expect(focusedTestId()).toBe('reference');
		});

		it('keeps the popup open while typing in the input and moving focus back to it', async () => {
			const component = await openFromInput();

			await userEvent.keyboard('ab');
			element('popup').focus();
			element('reference').focus();
			await wait(20);

			expect(component.store.open).toBe(true);
			expect((element('reference') as HTMLInputElement).value).toBe('ab');
		});

		it('moves Tab from the input to the next control and closes the modal popup', async () => {
			const component = await openFromInput();

			await userEvent.tab();

			expect(focusedTestId()).toBe('after');
			await expect.poll(() => component.store.open).toBe(false);
			expect(component.store.lastReason).toBe('focus-out');
		});

		it('closes on Tab from the input onto the control focused before the popup opened', async () => {
			const { component } = render(FocusModesHarness, {
				combobox: true,
				initialFocus: false,
				controls: 0
			});
			element('after').focus();
			flushSync(() => component.show('mouse'));
			element('reference').focus();

			await userEvent.tab();

			expect(focusedTestId()).toBe('after');
			await expect.poll(() => component.store.open).toBe(false);
		});

		it('lets Tab leave a focused popup that has no tabbable content', async () => {
			const component = await openFromInput();
			element('popup').focus();

			await userEvent.tab();

			expect(focusedTestId()).toBe('after');
			await expect.poll(() => component.store.open).toBe(false);
		});
	});

	describe('focus guards inside a positioner', () => {
		it('focuses the first control inside the popup on open', async () => {
			const { component } = render(FocusModesHarness, { positioner: true, controls: 2 });

			flushSync(() => component.show('keyboard'));

			await expect.poll(focusedTestId).toBe('first');
		});

		it('wraps Tab and Shift+Tab between the first and last controls', async () => {
			const { component } = render(FocusModesHarness, { positioner: true, controls: 2 });
			flushSync(() => component.show('keyboard'));
			element('last').focus();

			await userEvent.tab();
			await expect.poll(focusedTestId).toBe('first');

			await userEvent.tab({ shift: true });
			await expect.poll(focusedTestId).toBe('last');
		});
	});
});
