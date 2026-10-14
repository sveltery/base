// Assertions follow Base UI v1.9.0 packages/react/src/utils/popups/useTriggerFocusGuards.test.tsx
// and packages/react/src/popover/root/PopoverRoot.test.tsx
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverFocusGuardHarness from '../../tests/PopoverFocusGuardHarness.svelte';

function byTestId(id: string) {
	return page.getByTestId(id).element() as HTMLElement;
}

function trigger() {
	return page.getByRole('button', { name: 'Toggle' }).element() as HTMLElement;
}

function popupCount() {
	return document.querySelectorAll('[data-testid="popup"]').length;
}

async function openPopup() {
	await page.getByRole('button', { name: 'Toggle' }).click();
	await expect.poll(() => document.activeElement).toBe(byTestId('inside'));
}

function trackFocusedGuards() {
	const focused: Element[] = [];
	function onFocusIn(event: FocusEvent) {
		const target = event.target as Element;
		if (target.hasAttribute('data-base-ui-focus-guard')) focused.push(target);
	}
	document.addEventListener('focusin', onFocusIn);
	return { focused, stop: () => document.removeEventListener('focusin', onFocusIn) };
}

describe.for(['forward', 'backward'] as const)('tabbing %s from an open popover', (direction) => {
	/** Puts focus on the element the upcoming Tab leaves from. */
	function focusTabOrigin() {
		(direction === 'backward' ? trigger() : byTestId('inside')).focus();
	}

	it.for([
		['element', 0],
		['function', 0],
		['element', -1],
		['function', -1]
	] as const)(
		'keeps the tab destination after the exit transition with finalFocus as an %s and trigger tabindex=%s',
		async ([finalFocus, tabindex]) => {
			render(PopoverFocusGuardHarness, { tabindex, finalFocus });
			await openPopup();
			if (direction === 'backward') await userEvent.tab({ shift: true });
			else focusTabOrigin();

			expect(document.activeElement).toBe(
				direction === 'backward' ? trigger() : byTestId('inside')
			);
			expect(trigger().getAttribute('aria-expanded')).toBe('true');

			await userEvent.tab({ shift: direction === 'backward' });

			const destination = byTestId(direction === 'backward' ? 'before' : 'after');
			expect(document.activeElement).toBe(destination);
			await expect.poll(popupCount).toBe(0);
			expect(document.activeElement).toBe(destination);
			expect(trigger().getAttribute('tabindex')).toBe(String(tabindex));
		}
	);

	it('calls the finalFocus function on a focus-out close and keeps the tab destination', async () => {
		const calls: (string | null)[] = [];
		render(PopoverFocusGuardHarness, {
			tabindex: 0,
			finalFocus: 'function',
			onFinalFocus: (closeType) => calls.push(closeType)
		});
		await openPopup();
		focusTabOrigin();

		await userEvent.tab({ shift: direction === 'backward' });
		await expect.poll(popupCount).toBe(0);

		expect(calls).toEqual(['keyboard']);
		expect(document.activeElement).toBe(byTestId(direction === 'backward' ? 'before' : 'after'));
	});

	it.for(['disabled', 'tabIndex', 'hidden', 'removed', 'inserted', 'reordered'] as const)(
		'uses the current tab order when an adjacent control is %s during close',
		async (change) => {
			render(PopoverFocusGuardHarness, { tabindex: -1, change, direction });
			await openPopup();
			focusTabOrigin();
			await userEvent.tab({ shift: direction === 'backward' });

			expect(document.activeElement).toBe(byTestId('target'));
			await expect.poll(popupCount).toBe(0);
			expect(document.activeElement).toBe(byTestId('target'));
		}
	);

	it('keeps the surrounding modal dialog focus trap', async () => {
		render(PopoverFocusGuardHarness, { tabindex: -1, dialog: true, direction });
		const destination = page.getByRole('button', { name: 'Inside dialog' });
		await expect.poll(() => document.activeElement).toBe(destination.element());

		await openPopup();
		focusTabOrigin();
		await userEvent.tab({ shift: direction === 'backward' });

		await expect.poll(popupCount).toBe(0);
		await expect.poll(() => document.activeElement).toBe(destination.element());
	});

	it.for([0, -1])(
		'returns focus to the trigger without looping between guards when nothing else is tabbable (tabindex=%s)',
		async (tabindex) => {
			render(PopoverFocusGuardHarness, { tabindex, outside: false });
			await openPopup();
			focusTabOrigin();

			const guards = trackFocusedGuards();
			try {
				await userEvent.tab({ shift: direction === 'backward' });
			} finally {
				guards.stop();
			}

			await expect.poll(popupCount).toBe(0);
			expect(new Set(guards.focused).size).toBe(guards.focused.length);
			expect(document.activeElement).toBe(trigger());
			expect(trigger().getAttribute('tabindex')).toBe(String(tabindex));
		}
	);
});

it('moves focus to the control after the trigger when tabbing from it during the exit animation', async () => {
	render(PopoverFocusGuardHarness);
	await openPopup();
	await page.getByRole('button', { name: 'Toggle' }).click();
	await expect.poll(() => byTestId('popup').hasAttribute('data-ending-style')).toBe(true);
	expect(document.activeElement).toBe(trigger());

	await userEvent.tab();

	expect(document.activeElement).toBe(byTestId('after'));
	await expect.poll(popupCount).toBe(0);
	expect(document.activeElement).toBe(byTestId('after'));
});

it('moves focus to the element before the trigger when tabbing backward from the trigger of a popover rendered open', async () => {
	render(PopoverFocusGuardHarness, { open: true });
	await expect.poll(() => document.activeElement).toBe(byTestId('inside'));

	await userEvent.tab({ shift: true });
	await expect.poll(() => document.activeElement).toBe(trigger());

	await userEvent.tab({ shift: true });
	await expect.poll(() => document.activeElement).toBe(byTestId('before'));
	await expect.poll(popupCount).toBe(0);
});
