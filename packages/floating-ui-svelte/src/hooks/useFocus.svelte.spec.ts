// Assertions follow Base UI v1.9.0 packages/react/src/floating-ui-react/hooks/useFocus.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The upstream case runs in jsdom only. These run in Chromium, where `:focus-visible` is real,
// so focus comes from the keyboard and the extra cases cover what jsdom cannot.
import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createChangeEventDetails, REASONS } from '@sveltery/utils';
import FocusHarness from './__tests__/FocusHarness.svelte';
import { parkPointer } from './__tests__/pointer.js';

beforeEach(async () => {
	await parkPointer();
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function state() {
	const output = page.getByTestId('state').element();
	return {
		open: output.dataset.open,
		reason: output.dataset.reason,
		trigger: output.textContent?.trim()
	};
}

async function tabToTrigger() {
	await userEvent.click(page.getByTestId('start'));
	await userEvent.keyboard('{Tab}');
}

describe('FocusInteraction', () => {
	describe('with an open delay', () => {
		// A real 60ms delay can run out while a loaded browser handles the Tab, before the test
		// checks that the popup is still closed. The fake clock only moves when the test says so.
		beforeEach(() => {
			vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
		});
		afterEach(() => {
			vi.useRealTimers();
		});

		it('does not reopen when focus is restored after leaving the tab', async () => {
			render(FocusHarness, { delay: 60 });
			await tabToTrigger();
			const first = page.getByTestId('first').element();
			expect(document.activeElement).toBe(first);
			expect(state().open).toBe('false');

			window.dispatchEvent(new Event('blur'));
			first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
			await vi.advanceTimersByTimeAsync(200);

			expect(state().open).toBe('false');
			expect(document.querySelector('[role="tooltip"]')).toBeNull();
		});

		it('opens after the delay when the same focus is not preceded by a window blur', async () => {
			render(FocusHarness, { delay: 60 });
			await tabToTrigger();
			expect(state().open).toBe('false');

			await vi.advanceTimersByTimeAsync(59);
			expect(state().open).toBe('false');
			await vi.advanceTimersByTimeAsync(1);
			expect(state().open).toBe('true');
			expect(state().reason).toBe('trigger-focus');
			expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
		});
	});

	it('opens at once on keyboard focus when there is no delay and closes when focus leaves', async () => {
		render(FocusHarness, {});
		await tabToTrigger();
		expect(state()).toEqual({ open: 'true', reason: 'trigger-focus', trigger: 'first' });

		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(page.getByTestId('outside').element());
		await expect.poll(() => state().open).toBe('false');
		expect(state().reason).toBe('trigger-focus');
	});

	it('does not open for mouse focus', async () => {
		render(FocusHarness, {});
		await userEvent.click(page.getByTestId('first'));
		expect(document.activeElement).toBe(page.getByTestId('first').element());
		expect(state().open).toBe('false');
	});

	it('does nothing while disabled', async () => {
		render(FocusHarness, { enabled: false });
		await tabToTrigger();
		expect(document.activeElement).toBe(page.getByTestId('first').element());
		expect(state().open).toBe('false');
	});

	it('keeps the popup open while focus moves into it', async () => {
		render(FocusHarness, {});
		await tabToTrigger();
		expect(state().open).toBe('true');

		page.getByTestId('floating').element().focus();
		await wait(50);

		expect(document.activeElement).toBe(page.getByTestId('floating').element());
		expect(state().open).toBe('true');
	});

	it('keeps the popup open and retargets it when focus moves to another trigger', async () => {
		render(FocusHarness, { secondTrigger: true });
		await tabToTrigger();
		expect(state().trigger).toBe('first');

		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(page.getByTestId('second').element());
		await wait(50);

		expect(state()).toEqual({ open: 'true', reason: 'trigger-focus', trigger: 'second' });
	});

	it('keeps its window listeners when focus moves to another trigger', async () => {
		render(FocusHarness, { secondTrigger: true });
		await tabToTrigger();
		expect(state().trigger).toBe('first');
		const added = vi.spyOn(window, 'addEventListener');
		const removed = vi.spyOn(window, 'removeEventListener');

		await userEvent.keyboard('{Tab}');
		await wait(50);

		expect(state().trigger).toBe('second');
		expect(added.mock.calls.filter(([type]) => type === 'blur')).toEqual([]);
		expect(removed.mock.calls.filter(([type]) => type === 'blur')).toEqual([]);
		added.mockRestore();
		removed.mockRestore();
	});

	it('keeps the Escape close when a pending blur check runs after the popup unmounts', async () => {
		const { component } = render(FocusHarness, {});
		const { store } = component;
		await tabToTrigger();
		const first = page.getByTestId('first').element() as HTMLElement;
		expect(store.open).toBe(true);

		// Focus leaves and comes back before the blur check's timer runs.
		(page.getByTestId('outside').element() as HTMLElement).focus();
		first.focus();
		store.setOpen(false, createChangeEventDetails(REASONS.escapeKey));
		// A popup store drops its trigger once the closed popup unmounts.
		store.domReferenceElement = null;
		await wait(50);

		expect(document.activeElement).toBe(first);
		expect(store.lastReason).toBe('escape-key');
	});

	it('does not reopen when focus returns to the tab after the closed popup unmounts', async () => {
		const { component } = render(FocusHarness, {});
		const { store } = component;
		await tabToTrigger();
		const first = page.getByTestId('first').element();
		expect(store.open).toBe(true);

		store.setOpen(false, createChangeEventDetails(REASONS.outsidePress));
		store.domReferenceElement = null;
		window.dispatchEvent(new Event('blur'));
		first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

		expect(document.activeElement).toBe(first);
		expect(store.open).toBe(false);
		expect(store.lastReason).toBe('outside-press');
	});

	it('does not reopen on refocus after Escape until the pointer leaves', async () => {
		const { component } = render(FocusHarness, {});
		const { store } = component;
		await tabToTrigger();
		const first = page.getByTestId('first').element();
		expect(store.open).toBe(true);

		store.setOpen(false, createChangeEventDetails(REASONS.escapeKey));
		first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		expect(store.open).toBe(false);

		first.dispatchEvent(new MouseEvent('mouseleave'));
		first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
		expect(store.open).toBe(true);
	});

	it('does not reopen the last trigger after Escape closes a popup opened without one', async () => {
		const { component } = render(FocusHarness, {});
		const { store } = component;
		await tabToTrigger();
		const first = page.getByTestId('first').element();
		expect(store.open).toBe(true);
		store.setOpen(false, createChangeEventDetails(REASONS.outsidePress));
		// A popup store clears the active trigger once the closed popup unmounts.
		store.domReferenceElement = null;

		store.setOpen(true, createChangeEventDetails(REASONS.imperativeAction));
		store.setOpen(false, createChangeEventDetails(REASONS.escapeKey));
		first.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

		expect(document.activeElement).toBe(first);
		expect([store.open, store.lastReason]).toEqual([false, 'escape-key']);
	});
});
