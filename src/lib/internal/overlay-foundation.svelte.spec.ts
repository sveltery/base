// Phase 1a overlay primitives. Dialog and Popover are not mounted here.
import { page } from 'vitest/browser';
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
		await page
			.getByRole('dialog', { name: 'Notice' })
			.element()
			.ownerDocument.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
			);
		await expect.poll(() => page.getByRole('dialog', { name: 'Notice' }).elements().length).toBe(0);
		await expect.element(trigger).toHaveFocus();
		expect((await calls()).at(-1)).toEqual({ open: false, reason: 'escape-key', canceled: false });
	});

	it('keeps Tab inside the popup', async () => {
		render(OverlayFoundationHarness, { scenario: 'modal' });
		await page.getByRole('button', { name: 'Open' }).click();
		const inside = page.getByRole('button', { name: 'Inside' });
		await expect.element(inside).toHaveFocus();
		await inside
			.element()
			.ownerDocument.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
			);
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

	it('does not close when a press starts inside and releases outside', async () => {
		render(OverlayFoundationHarness, { scenario: 'drag' });
		await page.getByRole('button', { name: 'Open' }).click();
		const popup = page.getByRole('dialog', { name: 'Notice' });
		await expect.element(popup).toBeVisible();
		popup
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

	it('moves focus to an explicit return target after focus has left', async () => {
		render(OverlayFoundationHarness, { scenario: 'return' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await page.getByTestId('other').click();
		await expect.element(page.getByTestId('explicit')).toHaveFocus();
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

		popup
			.element()
			.ownerDocument.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
			);
		await expect.element(popup).toBeVisible();
		await expect.element(page.getByTestId('anchor')).toHaveAttribute('data-prevent-unmount', '');

		popup
			.element()
			.ownerDocument.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
			);
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

		child
			.element()
			.ownerDocument.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
			);
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
});
