// Phase 1a overlay primitives. Dialog and Popover are not mounted here.
import { flushSync } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NestedDismissHarness from '../../tests/NestedDismissHarness.svelte';
import OverlayFoundationHarness from '../../tests/OverlayFoundationHarness.svelte';
import ScrollLockHarness from '../../tests/ScrollLockHarness.svelte';

async function calls() {
	return JSON.parse(page.getByTestId('calls').element().textContent ?? '[]') as {
		open: boolean;
		reason: string;
		canceled: boolean;
	}[];
}

function overflowLocked() {
	return (
		document.documentElement.style.overflowY === 'hidden' ||
		document.body.style.overflowY === 'hidden'
	);
}

describe('overlay foundation', () => {
	it('portals the popup, focuses inside it, and toggles from the trigger', async () => {
		render(OverlayFoundationHarness, { scenario: 'modal' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();

		const popup = page.getByRole('dialog', { name: 'Notice' });
		await expect.element(popup).toHaveAttribute('data-open', '');
		await expect
			.poll(async () => page.getByTestId('statuses').element().textContent ?? '')
			.toContain('starting');
		expect(popup.element().closest('[data-testid="anchor"]')).toBeNull();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await expect.poll(overflowLocked).toBe(true);

		await expect.poll(() => popup.element().hasAttribute('data-starting-style')).toBe(false);
		await page.getByRole('button', { name: 'Open', includeHidden: true }).click({ force: true });
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
		await expect.poll(overflowLocked).toBe(false);
		expect(await calls()).toEqual([
			{ open: true, reason: 'trigger-press', canceled: false },
			{ open: false, reason: 'trigger-press', canceled: false }
		]);
	});

	it('closes on Escape and returns focus to the trigger', async () => {
		render(OverlayFoundationHarness, { scenario: 'modal' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
		await expect.element(trigger).toHaveFocus();
		expect((await calls()).at(-1)).toEqual({ open: false, reason: 'escape-key', canceled: false });
	});

	it('keeps Tab inside the popup', async () => {
		render(OverlayFoundationHarness, { scenario: 'modal' });
		await page.getByRole('button', { name: 'Open' }).click();
		const inside = page.getByRole('button', { name: 'Inside' });
		await expect.element(inside).toHaveFocus();
		await userEvent.keyboard('{Tab}');
		await expect.element(page.getByRole('button', { name: 'Chosen' })).toHaveFocus();
		await userEvent.keyboard('{Tab}');
		await expect.element(inside).toHaveFocus();
	});

	it('dismisses a modeless popup on an outside press', async () => {
		render(OverlayFoundationHarness, { scenario: 'modeless' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('dialog', { name: 'Notice' })).toBeVisible();
		await page.getByTestId('outside').click();
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
		expect((await calls()).at(-1)).toEqual({
			open: false,
			reason: 'outside-press',
			canceled: false
		});
	});

	it('closes on a later outside press after an inside press is cancelled', async () => {
		render(OverlayFoundationHarness, { scenario: 'modeless' });
		await page.getByRole('button', { name: 'Open' }).click();
		const popup = page.getByRole('dialog', { name: 'Notice' });
		await expect.element(popup).toBeVisible();
		popup.element().dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				pointerType: 'touch'
			})
		);
		popup.element().ownerDocument.dispatchEvent(
			new PointerEvent('pointercancel', {
				bubbles: true,
				cancelable: true,
				pointerType: 'touch'
			})
		);
		page
			.getByTestId('outside')
			.element()
			.dispatchEvent(
				new PointerEvent('pointerdown', {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: 'mouse'
				})
			);
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
	});

	it('does not close when a press starts inside and releases outside', async () => {
		render(OverlayFoundationHarness, { scenario: 'drag' });
		await page.getByRole('button', { name: 'Open' }).click();
		const popup = page.getByRole('dialog', { name: 'Notice' });
		await expect.element(popup).toBeVisible();
		popup.element().dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				pointerType: 'mouse'
			})
		);
		page
			.getByTestId('outside')
			.element()
			.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
		await expect.element(popup).toBeVisible();

		page
			.getByTestId('outside')
			.element()
			.dispatchEvent(
				new PointerEvent('pointerdown', {
					bubbles: true,
					cancelable: true,
					button: 0,
					pointerType: 'mouse'
				})
			);
		page
			.getByTestId('outside')
			.element()
			.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
	});

	it('settles a function initialFocus once for the open interaction', async () => {
		render(OverlayFoundationHarness, { scenario: 'initial' });
		expect(page.getByTestId('initial-calls').element().textContent).toBe('0');
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByTestId('chosen')).toHaveFocus();
		expect(page.getByTestId('initial-calls').element().textContent).toBe('1');
		expect(page.getByTestId('initial-kind').element().textContent).toBe('mouse');
		await page.getByTestId('nudge').click();
		expect(page.getByTestId('initial-calls').element().textContent).toBe('1');
	});

	it('skips initial focus when the function returns false', async () => {
		render(OverlayFoundationHarness, { scenario: 'initial-skip' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		await expect.element(page.getByRole('dialog', { name: 'Notice' })).toBeVisible();
		expect(document.activeElement).toBe(document.getElementById('open-trigger'));
		expect(page.getByTestId('initial-calls').element().textContent).toBe('1');
	});

	it('reports Escape as the close interaction after a pointer open', async () => {
		render(OverlayFoundationHarness, { scenario: 'close-type' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => page.getByTestId('close-kind').element().textContent).toBe('keyboard');
		await expect.element(trigger).toHaveFocus();
	});

	it('leaves focus on the clicked control when returnFocus is null', async () => {
		render(OverlayFoundationHarness, { scenario: 'null-return' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await page.getByTestId('other').click();
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
		await expect.element(page.getByTestId('other')).toHaveFocus();
	});

	it('leaves focus on the clicked control when returnFocus is an element', async () => {
		render(OverlayFoundationHarness, { scenario: 'return' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await page.getByTestId('other').click();
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
		await expect.element(page.getByTestId('other')).toHaveFocus();
	});

	it('does not call returnFocus when a pointer focus-out closes', async () => {
		render(OverlayFoundationHarness, { scenario: 'fn-return' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await page.getByTestId('other').click();
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
		await expect.element(page.getByTestId('other')).toHaveFocus();
		// React calls the function and ignores its result. This port does not call it.
		expect(page.getByTestId('return-calls').element().textContent).toBe('0');
	});

	it('does not open when the change is canceled', async () => {
		render(OverlayFoundationHarness, { scenario: 'cancel' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
		expect(await calls()).toEqual([{ open: true, reason: 'trigger-press', canceled: true }]);
	});

	it('keeps a popup mounted when preventUnmountOnClose sticks after a canceled close', async () => {
		render(OverlayFoundationHarness, { scenario: 'stuck' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		const popup = page.getByRole('dialog', { name: 'Notice' });
		await expect.element(popup).toBeVisible();

		await userEvent.keyboard('{Escape}');
		await expect.element(popup).toBeVisible();
		await expect.element(page.getByTestId('anchor')).toHaveAttribute('data-prevent-unmount', '');

		await userEvent.keyboard('{Escape}');
		await expect.element(page.getByTestId('popup')).toHaveAttribute('data-closed', '');
		expect(page.getByTestId('popup').elements()).toHaveLength(1);
		await expect.element(page.getByTestId('anchor')).toHaveAttribute('data-prevent-unmount', '');
	});

	it('does not let Escape close a parent while a child popup is open', async () => {
		render(NestedDismissHarness);
		const parent = page.getByTestId('parent');
		const child = page.getByTestId('child');
		await expect.element(parent).toHaveAttribute('data-open', '');
		await expect.element(child).toHaveAttribute('data-open', '');

		(child.element() as HTMLElement).focus();
		await userEvent.keyboard('{Escape}');
		await expect.element(child).not.toHaveAttribute('data-open');
		await expect.element(parent).toHaveAttribute('data-open', '');
	});

	it('keeps the page locked until every scroll lock is released', async () => {
		render(ScrollLockHarness);
		const first = page.getByRole('button', { name: 'First lock' });
		const second = page.getByRole('button', { name: 'Second lock' });
		await first.click();
		await expect.poll(overflowLocked).toBe(true);
		await second.click();
		await expect.poll(overflowLocked).toBe(true);
		await first.click();
		await expect.poll(overflowLocked).toBe(true);
		await second.click();
		await expect.poll(overflowLocked).toBe(false);
	});

	it('does not open when the trigger unmounts during touchOpenDelay', async () => {
		const opened: boolean[] = [];
		const view = render(OverlayFoundationHarness, {
			scenario: 'modal',
			touchOpenDelay: 40,
			onOpened: () => opened.push(true)
		});
		const trigger = page.getByRole('button', { name: 'Open' }).element() as HTMLElement;
		trigger.dispatchEvent(
			new PointerEvent('pointerdown', {
				bubbles: true,
				cancelable: true,
				pointerType: 'touch',
				button: 0,
				isPrimary: true
			})
		);
		trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
		view.unmount();
		await new Promise<void>((resolve) => {
			setTimeout(resolve, 60);
		});
		expect(opened).toEqual([]);
	});

	it('wraps Tab through the guards and does not mark again when closeOnFocusOut changes', async () => {
		const view = render(OverlayFoundationHarness, { scenario: 'trap', focusOut: true });
		await page.getByRole('button', { name: 'Open' }).click();
		const one = page.getByTestId('one');
		const three = page.getByTestId('three');
		await expect.element(one).toHaveFocus();
		const watched = page.getByTestId('outside').element();
		let hiddenChanges = 0;
		const observer = new MutationObserver(() => {
			hiddenChanges += 1;
		});
		observer.observe(watched, { attributes: true, attributeFilter: ['aria-hidden'] });
		hiddenChanges = 0;
		await userEvent.keyboard('{Tab}');
		await expect.element(page.getByTestId('two')).toHaveFocus();
		await userEvent.keyboard('{Tab}');
		await expect.element(three).toHaveFocus();
		await userEvent.keyboard('{Tab}');
		await expect.element(one).toHaveFocus();
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		await expect.element(three).toHaveFocus();
		await view.rerender({ scenario: 'trap', focusOut: false });
		await expect.poll(() => page.getByTestId('three').element()).toHaveFocus();
		expect(hiddenChanges).toBe(0);
		observer.disconnect();
	});

	it('wraps from the checked radio and skips a disabled fieldset', async () => {
		render(OverlayFoundationHarness, { scenario: 'tabbable' });
		await page.getByRole('button', { name: 'Open' }).click();
		const real = page.getByTestId('real');
		const checked = page.getByRole('radio', { name: 'B' });
		await expect.element(real).toHaveFocus();
		(checked.element() as HTMLElement).focus();
		await userEvent.keyboard('{Tab}');
		await expect.element(real).toHaveFocus();
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		await expect.element(checked).toHaveFocus();
	});

	it('returns focus when flushSync commits the close', async () => {
		render(OverlayFoundationHarness, { scenario: 'modal' });
		const trigger = page.getByRole('button', { name: 'Open', includeHidden: true });
		await trigger.click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		flushSync(() => {
			(trigger.element() as HTMLElement).click();
		});
		expect(document.activeElement).toBe(trigger.element());
	});

	it('closes from Escape handled on the trigger', async () => {
		render(OverlayFoundationHarness, { scenario: 'modal' });
		const trigger = page.getByRole('button', { name: 'Open', includeHidden: true });
		await trigger.click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		(trigger.element() as HTMLElement).focus();
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
	});
});
