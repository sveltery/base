// Assertions follow Base UI v1.8.0 packages/react/src/popover/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Menu, Combobox, shadow-root outside press, and actionsRef are not ported.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverDetachHarness from '../../tests/PopoverDetachHarness.svelte';
import PopoverReviewHarness from '../../tests/PopoverReviewHarness.svelte';
import PopoverFixture from '../../routes/fixtures/popover/PopoverFixture.svelte';
import { Popover, PopoverHandle } from './index.js';
import { PopoverStore } from './store.svelte.js';

const moduleHandle = Popover.createHandle();

describe('Popover', () => {
	it('exports PopoverHandle as a class without Dialog payload writers', () => {
		const handle = new PopoverHandle();
		expect(handle).toBeInstanceOf(Popover.Handle);
		expect(new Popover.Handle()).toBeInstanceOf(PopoverHandle);
		expect('openWithPayload' in handle).toBe(false);
		expect('setPayload' in handle).toBe(false);
		expect('payloads' in handle).toBe(false);
		expect(handle.payload).toBeUndefined();
	});

	it('opens and closes from the trigger', async () => {
		render(PopoverFixture, { scenario: 'standalone' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		const popup = page.getByRole('dialog');
		await expect.element(popup).toBeVisible();
		await expect.element(popup).toHaveAttribute('data-open', '');
		await expect.element(trigger).toHaveAttribute('aria-controls', popup.element().id);
		expect(popup.element().id).toMatch(/^base-ui-/);
		await expect.element(page.getByRole('heading', { name: 'Title' })).toBeVisible();
		expect(popup.element().getAttribute('aria-labelledby')).toMatch(/^base-ui-/);
		await trigger.click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
	});

	it('closes on escape and outside press', async () => {
		render(PopoverFixture, { scenario: 'standalone' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		await page
			.getByRole('dialog')
			.element()
			.ownerDocument.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
		await trigger.click();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await page.getByRole('button', { name: 'Outside' }).click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
	});

	it('lets onOpenChange cancel the open', async () => {
		render(PopoverFixture, { scenario: 'cancel' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
		expect(page.getByTestId('calls').element().textContent).toContain('"canceled":true');
	});

	it('does not open a disabled trigger', async () => {
		render(PopoverFixture, { scenario: 'disabled' });
		const trigger = page.getByRole('button', { name: 'Open' });
		await expect.element(trigger).toHaveAttribute('disabled', '');
		await expect.element(trigger).toHaveAttribute('data-disabled', '');
		await trigger.click({ force: true });
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
	});

	it('opens a modal popover', async () => {
		render(PopoverFixture, { scenario: 'modal' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await expect
			.poll(() => document.querySelectorAll('[role="presentation"]:not([data-side])').length)
			.toBeGreaterThan(0);
		await page.getByRole('button', { name: 'Close' }).click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
	});

	it('opens on hover', async () => {
		render(PopoverFixture, { scenario: 'hover' });
		await page.getByRole('button', { name: 'Open' }).hover();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Open' }))
			.not.toHaveAttribute('data-pressed');
	});

	it('focuses the first item inside the popup', async () => {
		render(PopoverFixture, { scenario: 'standalone' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.poll(() => document.activeElement?.textContent).toBe('Inside');
	});

	it('throws outside the root', () => {
		expect(() => render(Popover.Popup)).toThrow(
			'Base UI: PopoverRootContext is missing. Popover parts must be placed within <Popover.Root>.'
		);
	});

	it('throws when the trigger has no root or handle', () => {
		expect(() => render(Popover.Trigger)).toThrow(
			'Base UI: <Popover.Trigger> must be either used within a <Popover.Root> component or provided with a handle.'
		);
	});

	it('calls initialFocus when focusing and returns focus after close', async () => {
		render(PopoverReviewHarness, { mode: 'focus' });
		expect(page.getByTestId('focus-calls').element().textContent).toBe('0');
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByTestId('focus-calls')).toHaveTextContent('1');
		await expect.poll(() => document.activeElement?.textContent).toBe('Inside');
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.poll(() => document.activeElement?.textContent).toBe('Final');
	});

	it('keeps a closed popup mounted', async () => {
		render(PopoverReviewHarness, { mode: 'mounted' });
		await page.getByRole('button', { name: 'Open' }).click();
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.poll(() => document.querySelectorAll('[role="dialog"]').length).toBe(1);
		await expect.element(page.getByTestId('positioner')).toHaveAttribute('hidden', '');
	});

	it('opens from defaultOpen without a click', async () => {
		render(PopoverReviewHarness, { mode: 'default-open' });
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Open' }))
			.toHaveAttribute('aria-expanded', 'true');
	});

	it('writes the trigger id through the value helper', async () => {
		render(PopoverReviewHarness, { mode: 'trigger' });
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByTestId('trigger-id')).toHaveTextContent('owned');
	});

	it('finds the trigger when its DOM id differs from the registered id', async () => {
		render(PopoverReviewHarness, { mode: 'trigger' });
		const button = page.getByRole('button', { name: 'Open' }).element();
		button.id = 'dom-only';
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Open' }))
			.toHaveAttribute('aria-expanded', 'true');
		await expect.element(page.getByTestId('trigger-id')).toHaveTextContent('owned');
	});

	it('opens a module-scope handle without creating an effect', async () => {
		render(PopoverReviewHarness, { mode: 'handle', handle: moduleHandle });
		expect(moduleHandle.isOpen).toBe(false);
		await page.getByRole('button', { name: 'Open' }).click();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await expect.element(page.getByTestId('handle-open')).toHaveTextContent('yes');
	});

	it('keeps one live title when the viewport switches triggers', async () => {
		render(PopoverReviewHarness, { mode: 'viewport' });
		await page.getByRole('button', { name: 'One' }).click();
		await expect.poll(() => document.querySelectorAll('#live-title').length).toBe(1);
		const input = page.getByTestId('live-input').element();
		if (!(input instanceof HTMLInputElement)) throw new Error('missing input');
		input.value = 'kept';
		const seen: Array<{
			hidden: string | null;
			inert: boolean;
			follows: boolean;
			titles: number;
			value: string;
		}> = [];
		const observer = new MutationObserver(() => {
			const previous = document.querySelector('[data-previous]');
			const current = document.querySelector('[data-current]');
			if (!(previous instanceof HTMLElement) || !previous.isConnected || !current) return;
			const copied = previous.querySelector('input');
			if (!(copied instanceof HTMLInputElement) || copied.value !== 'kept') return;
			seen.push({
				hidden: previous.getAttribute('aria-hidden'),
				inert: previous.inert,
				follows: Boolean(
					previous.compareDocumentPosition(current) & Node.DOCUMENT_POSITION_FOLLOWING
				),
				titles: document.querySelectorAll('#live-title').length,
				value: copied.value
			});
		});
		observer.observe(document.body, { subtree: true, childList: true, attributes: true });
		await page.getByRole('button', { name: 'Two' }).click();
		await expect.poll(() => seen[0]).toBeTruthy();
		observer.disconnect();
		const captured = seen[0];
		expect(captured.titles).toBe(1);
		expect(captured.hidden).toBe('true');
		expect(captured.inert).toBe(true);
		expect(captured.follows).toBe(true);
		expect(captured.value).toBe('kept');
	});

	it('copies the trigger being left when the viewport switches', async () => {
		render(PopoverReviewHarness, { mode: 'viewport' });
		await page.getByRole('button', { name: 'One' }).click();
		await expect
			.poll(() => document.querySelector('[data-current] [data-testid=pane-text]')?.textContent)
			.toBe('content-AAA');
		const seen: HTMLElement[] = [];
		const observer = new MutationObserver(() => {
			const previous = document.querySelector('[data-previous]');
			if (previous instanceof HTMLElement && !seen.includes(previous)) seen.push(previous);
		});
		observer.observe(document.body, { subtree: true, childList: true, attributes: true });
		await page.getByRole('button', { name: 'Two' }).click();
		await expect
			.poll(() => {
				const previous = document.querySelector('[data-previous]') ?? seen[0];
				return previous?.textContent ?? '';
			})
			.toContain('content-AAA');
		observer.disconnect();
		const previous = document.querySelector('[data-previous]') ?? seen[0];
		expect(previous?.textContent ?? '').not.toContain('content-BBB');
		expect(document.querySelector('[data-current] [data-testid=pane-text]')?.textContent).toBe(
			'content-BBB'
		);
	});

	it('keeps the live radio checked when the viewport switches triggers', async () => {
		render(PopoverReviewHarness, { mode: 'viewport' });
		await page.getByRole('button', { name: 'One' }).click();
		const live = page.getByTestId('live-radio').element();
		if (!(live instanceof HTMLInputElement)) throw new Error('missing radio');
		live.checked = true;
		const seen: HTMLElement[] = [];
		const observer = new MutationObserver(() => {
			const previous = document.querySelector('[data-previous]');
			if (previous instanceof HTMLElement && !seen.includes(previous)) seen.push(previous);
		});
		observer.observe(document.body, { subtree: true, childList: true, attributes: true });
		await page.getByRole('button', { name: 'Two' }).click();
		await expect
			.poll(() => {
				const previous = document.querySelector('[data-previous]') ?? seen[0];
				return previous?.querySelector('input[type="radio"]') ?? null;
			})
			.toBeTruthy();
		observer.disconnect();
		const previous = document.querySelector('[data-previous]') ?? seen[0];
		const current = document.querySelector('[data-current] [data-testid=live-radio]');
		const copied = previous?.querySelector('input[type="radio"]');
		if (!(current instanceof HTMLInputElement) || !(copied instanceof HTMLInputElement)) {
			throw new Error('missing radios');
		}
		expect(current.checked).toBe(true);
		expect(copied.hasAttribute('name')).toBe(false);
	});

	it('registers each trigger once across an open and a switch', async () => {
		let notes = 0;
		const original = PopoverStore.prototype.noteTrigger;
		PopoverStore.prototype.noteTrigger = function (this: PopoverStore, ...args) {
			notes += 1;
			return original.apply(this, args);
		};
		try {
			render(PopoverReviewHarness, { mode: 'viewport' });
			await page.getByRole('button', { name: 'One' }).click();
			await expect.element(page.getByRole('dialog')).toBeVisible();
			await page.getByRole('button', { name: 'Two' }).click();
			await expect
				.poll(() => document.querySelector('[data-current] [data-testid=pane-text]')?.textContent)
				.toBe('content-BBB');
			expect(notes).toBe(2);
		} finally {
			PopoverStore.prototype.noteTrigger = original;
		}
	});

	it('opens again after the root unmounts and remounts', async () => {
		const view = render(PopoverDetachHarness, { mode: 'lifecycle', rootMounted: true });
		const trigger = page.getByRole('button', { name: 'Open' });
		await trigger.click();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await trigger.click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
		await view.rerender({ mode: 'lifecycle', rootMounted: false });
		await trigger.click();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
		await view.rerender({ mode: 'lifecycle', rootMounted: true });
		await trigger.click();
		await expect.element(page.getByRole('dialog')).toBeVisible();
	});

	it('removes the first root hover listeners after the trigger unmounts', async () => {
		const tracked = trackHoverListeners();
		try {
			const view = render(PopoverDetachHarness, { mode: 'lifecycle', rootMounted: true });
			const trigger = page.getByRole('button', { name: 'Open' }).element();
			await expect
				.poll(() => hoverTypes(tracked, trigger).sort())
				.toEqual(['mouseenter', 'mouseleave', 'pointerenter']);
			const root1 = [...(tracked.get(trigger) ?? [])];
			await view.rerender({ mode: 'lifecycle', rootMounted: false });
			await view.rerender({ mode: 'lifecycle', rootMounted: true });
			view.unmount();
			await expect
				.poll(() => (tracked.get(trigger) ?? []).filter((entry) => !entry.removed).length)
				.toBe(0);
			expect(root1.every((entry) => entry.removed)).toBe(true);
		} finally {
			restoreHoverListeners();
		}
	});

	it('keeps copied viewport controls out of form submission', async () => {
		for (const portalIntoForm of [false, true]) {
			const view = render(PopoverDetachHarness, { mode: 'form', portalIntoForm });
			try {
				await page.getByRole('button', { name: 'One' }).click();
				await expect.element(page.getByTestId('live-input')).toHaveValue('AAA');
				if (portalIntoForm) {
					const form = page.getByTestId('hosted-form').element();
					await expect.poll(() => form.contains(page.getByRole('dialog').element())).toBe(true);
				}
				const fields = await fieldsDuringCrossFade(portalIntoForm ? 'hosted-form' : 'outer-form');
				expect(fields).toEqual(['BBB']);
			} finally {
				view.unmount();
			}
		}
	});
});

type HoverEntry = { type: string; listener: EventListener; removed: boolean };

const hoverTypesWanted = new Set(['mouseenter', 'mouseleave', 'pointerenter']);
const originalAdd = HTMLElement.prototype.addEventListener;
const originalRemove = HTMLElement.prototype.removeEventListener;

function trackHoverListeners() {
	const tracked = new WeakMap<EventTarget, HoverEntry[]>();
	HTMLElement.prototype.addEventListener = function (
		type: string,
		listener: EventListenerOrEventListenerObject | null,
		options?: boolean | AddEventListenerOptions
	) {
		if (hoverTypesWanted.has(type) && typeof listener === 'function') {
			const list = tracked.get(this) ?? [];
			list.push({ type, listener, removed: false });
			tracked.set(this, list);
		}
		return originalAdd.call(this, type, listener as EventListenerOrEventListenerObject, options);
	};
	HTMLElement.prototype.removeEventListener = function (
		type: string,
		listener: EventListenerOrEventListenerObject | null,
		options?: boolean | EventListenerOptions
	) {
		if (typeof listener === 'function') {
			const entry = tracked
				.get(this)
				?.find((item) => item.type === type && item.listener === listener && !item.removed);
			if (entry) entry.removed = true;
		}
		return originalRemove.call(this, type, listener as EventListenerOrEventListenerObject, options);
	};
	return tracked;
}

function restoreHoverListeners() {
	HTMLElement.prototype.addEventListener = originalAdd;
	HTMLElement.prototype.removeEventListener = originalRemove;
}

function hoverTypes(tracked: WeakMap<EventTarget, HoverEntry[]>, node: EventTarget) {
	return (tracked.get(node) ?? []).filter((entry) => !entry.removed).map((entry) => entry.type);
}

async function fieldsDuringCrossFade(formId: string) {
	let fields: string[] | null = null;
	const observer = new MutationObserver(() => {
		const copied = document.querySelector('[data-previous] input');
		if (!(copied instanceof HTMLInputElement) || !copied.isConnected) return;
		const form = document.getElementById(formId);
		if (!(form instanceof HTMLFormElement)) return;
		fields = [...new FormData(form).getAll('field')].map(String);
	});
	observer.observe(document.body, { childList: true, subtree: true });
	await page.getByRole('button', { name: 'Two' }).click();
	await expect.poll(() => fields).not.toBeNull();
	observer.disconnect();
	return fields ?? [];
}
