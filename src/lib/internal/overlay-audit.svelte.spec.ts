// Touch dismiss, container focus, and finalFocus={null} against Base UI v1.8.0
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { tabbable } from './floating-ui-react/utils/tabbable.js';
import OverlayAuditHarness from '../../tests/OverlayAuditHarness.svelte';

function touchPoint(target: EventTarget, x: number, y: number, identifier = 1) {
	return new Touch({ identifier, target, clientX: x, clientY: y });
}

function fireTouch(
	target: HTMLElement,
	type: 'touchstart' | 'touchmove' | 'touchend',
	touches: Touch[],
	changedTouches: Touch[] = touches
) {
	target.dispatchEvent(
		new TouchEvent(type, { bubbles: true, cancelable: true, touches, changedTouches })
	);
}

/** Upstream's outside tap: pointerdown, a 6px move, then touchend. */
function tapOutside(element: HTMLElement) {
	element.dispatchEvent(
		new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'touch' })
	);
	const start = touchPoint(element, 50, 50);
	const end = touchPoint(element, 50, 56);
	fireTouch(element, 'touchstart', [start]);
	fireTouch(element, 'touchmove', [end]);
	fireTouch(element, 'touchend', [], [end]);
}

function dialogs() {
	return page.getByRole('dialog', { includeHidden: true }).elements();
}

describe('overlay audit', () => {
	it('keeps focus on the inner button when a dialog container swaps', async () => {
		render(OverlayAuditHarness, { case: 'swap', part: 'dialog' });
		const inside = page.getByRole('button', { name: 'Inside' });
		await expect.element(inside).toHaveFocus();
		const boxB = page.getByTestId('box-b').element();
		const holder = page.getByTestId('box-a').element() as HTMLDivElement & { swap: () => void };
		holder.swap();
		await tick();
		expect(document.querySelector('[role="dialog"]')?.parentElement?.parentElement).toBe(boxB);
		expect(document.activeElement).toBe(inside.element());
	});

	it('keeps focus on the inner button when a popover container swaps', async () => {
		render(OverlayAuditHarness, { case: 'swap', part: 'popover' });
		const inside = page.getByRole('button', { name: 'Inside' });
		await expect.element(inside).toHaveFocus();
		const boxB = page.getByTestId('box-b').element();
		const holder = page.getByTestId('box-a').element() as HTMLDivElement & { swap: () => void };
		holder.swap();
		await tick();
		expect(
			document.querySelector('[role="dialog"]')?.closest('[data-base-ui-portal]')?.parentElement
		).toBe(boxB);
		expect(document.activeElement).toBe(inside.element());
	});

	it('sends focus to the outer popup when a nested container is cleared', async () => {
		render(OverlayAuditHarness, { case: 'nested-clear' });
		const inner = page.getByTestId('inner-inside');
		await expect.element(inner).toHaveFocus();
		const trigger = page
			.getByRole('button', { name: 'Inner', exact: true, includeHidden: true })
			.element();
		const outer = page.getByTestId('outer-popup').element();
		const holder = page.getByTestId('inner-holder').element() as HTMLDivElement & {
			clearContainer: () => void;
		};
		holder.clearContainer();
		await tick();
		expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
		expect(document.activeElement).toBe(outer);
		expect(document.activeElement).not.toBe(trigger);
	});

	it('does not return focus when a popover finalFocus is null', async () => {
		render(OverlayAuditHarness, { case: 'popover-null' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		expect(document.activeElement).not.toBe(trigger.element());
		expect(document.activeElement).toBe(document.body);
	});

	it('returns focus to the trigger when a focus-trapping popover backdrop is clicked', async () => {
		render(OverlayAuditHarness, { case: 'popover-backdrop' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		const backdrop = document.querySelector(
			'[data-base-ui-portal] [role="presentation"][data-base-ui-inert]'
		);
		if (!(backdrop instanceof HTMLElement)) throw new Error('missing backdrop');
		backdrop.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		backdrop.click();
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(trigger.element());
	});

	it('returns focus to the trigger when a trap-focus popover backdrop is clicked', async () => {
		render(OverlayAuditHarness, { case: 'popover-trap' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		await expect.element(page.getByRole('button', { name: 'Inside' })).toHaveFocus();
		const backdrop = page.getByTestId('user-backdrop');
		await userEvent.click(backdrop);
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
		await expect.poll(() => document.activeElement).toBe(trigger.element());
	});

	it('keeps a modal popover open through pointerdown and closes it on touchend', async () => {
		render(OverlayAuditHarness, { case: 'popover-backdrop' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		const backdrop = document.querySelector(
			'[data-base-ui-portal] [role="presentation"][data-base-ui-inert]'
		);
		if (!(backdrop instanceof HTMLElement)) throw new Error('missing backdrop');
		backdrop.dispatchEvent(
			new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'touch' })
		);
		const start = touchPoint(backdrop, 40, 40);
		const moved = touchPoint(backdrop, 40, 46);
		fireTouch(backdrop, 'touchstart', [start]);
		fireTouch(backdrop, 'touchmove', [moved]);
		await tick();
		expect(document.querySelector('[role="dialog"]')).not.toBeNull();
		fireTouch(backdrop, 'touchend', [], [moved]);
		await expect.poll(() => document.querySelector('[role="dialog"]')).toBeNull();
	});

	it('closes only the inner modal popover on an outside touch tap', async () => {
		render(OverlayAuditHarness, { case: 'nested-popovers' });
		await page.getByRole('button', { name: 'Outer' }).click();
		await page.getByRole('button', { name: 'Inner', includeHidden: true }).click();
		await expect.poll(() => dialogs().length).toBe(2);
		const outside = page.getByTestId('outside').element() as HTMLElement;
		outside.dispatchEvent(
			new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'touch' })
		);
		await tick();
		expect(dialogs()).toHaveLength(2);
		tapOutside(outside);
		await expect.poll(() => dialogs().length).toBe(1);
		expect(page.getByTestId('inner-popup').elements()).toHaveLength(0);
	});
});

describe('tabbable walk', () => {
	function root() {
		const node = document.createElement('div');
		document.body.append(node);
		return node;
	}

	it('keeps only the checked radio', () => {
		const node = root();
		node.innerHTML =
			'<input type="radio" name="g" value="a"><input type="radio" name="g" value="b" checked>';
		const items = tabbable(node);
		expect(items.map((item) => (item as HTMLInputElement).value)).toEqual(['b']);
		node.remove();
	});

	it('skips a control inside a disabled fieldset', () => {
		const node = root();
		node.innerHTML =
			'<fieldset disabled><button type="button">No</button></fieldset><button type="button">Yes</button>';
		expect(tabbable(node).map((item) => item.textContent)).toEqual(['Yes']);
		node.remove();
	});

	it('skips a negative tabIndex and a hidden input', () => {
		const node = root();
		node.innerHTML =
			'<button type="button" tabindex="-1">Skip</button><input type="hidden"><button type="button">Keep</button>';
		expect(tabbable(node).map((item) => item.textContent)).toEqual(['Keep']);
		node.remove();
	});

	it('skips controls inside a closed details element', () => {
		const node = root();
		node.innerHTML =
			'<details><summary>Summary</summary><button type="button">Hidden</button></details>';
		expect(tabbable(node).map((item) => item.textContent)).toEqual(['Summary']);
		node.remove();
	});

	it('walks into an open shadow root', () => {
		const node = root();
		const host = document.createElement('div');
		node.append(host);
		const shadow = host.attachShadow({ mode: 'open' });
		const button = document.createElement('button');
		button.textContent = 'Shadow';
		shadow.append(button);
		expect(tabbable(node)).toEqual([button]);
		node.remove();
	});

	it('includes a media control and an iframe, and treats a negative contenteditable index as zero', () => {
		const node = root();
		const video = document.createElement('video');
		video.controls = true;
		const iframe = document.createElement('iframe');
		iframe.title = 'frame';
		const editable = document.createElement('div');
		editable.contentEditable = 'true';
		editable.tabIndex = -1;
		editable.textContent = 'Edit';
		node.append(video, iframe, editable);
		const items = tabbable(node);
		expect(items).toContain(video);
		expect(items).toContain(iframe);
		expect(items).toContain(editable);
		node.remove();
	});

	it('skips an inert ancestor and a closed details descendant', () => {
		const node = root();
		node.innerHTML =
			'<div inert><button type="button">Inert</button></div><button type="button" hidden>Hidden</button>';
		expect(tabbable(node)).toEqual([]);
		node.remove();
	});
});
