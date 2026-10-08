// Assertions follow Base UI v1.8.0 packages/react/src/popover/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Menu, Combobox, shadow-root outside press, and actionsRef are not ported.
import { tick } from 'svelte';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PopoverDetachHarness from '../../tests/PopoverDetachHarness.svelte';
import PortalContainerHarness from '../../tests/PortalContainerHarness.svelte';
import PortalHostHarness from '../../tests/PortalHostHarness.svelte';
import PopoverOpenCompleteStateHarness from '../../tests/PopoverOpenCompleteStateHarness.svelte';
import PortalRenderHarness from '../../tests/PortalRenderHarness.svelte';
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

	it('forwards host attributes and attachments onto the portal element', async () => {
		render(PortalHostHarness, { part: 'popover' });

		await expect.poll(() => document.querySelector('[data-slot="popover-portal"]')).not.toBeNull();
		const portal = document.querySelector('[data-slot="popover-portal"]');
		if (!(portal instanceof HTMLDivElement)) throw new Error('portal is not a div');

		expect(portal.classList.contains('portal-host')).toBe(true);
		expect(portal.getAttribute('data-probe')).toBe('probe');
		expect(portal.dataset.attached).toBe('yes');
		// The consumer attachment runs after the move, so it sees the container.
		expect(portal.dataset.attachedInBody).toBe('yes');
		expect(portal.parentElement).toBe(document.body);
		expect(portal.querySelector('[role="dialog"]')).not.toBeNull();
		// The marker stays empty. A consumer value does not replace it.
		expect(portal.getAttribute('data-base-ui-portal')).toBe('');
	});

	it('applies a render snippet to the portal element', async () => {
		render(PortalRenderHarness, { part: 'popover' });

		await expect.poll(() => document.querySelector('[data-replacement]')).not.toBeNull();
		const portal = document.querySelector('[data-replacement]');
		if (!(portal instanceof HTMLDivElement)) throw new Error('portal is not a div');

		expect(portal.getAttribute('data-slot')).toBe('popover-portal');
		expect(portal.classList.contains('portal-host')).toBe(true);
		expect(portal.getAttribute('data-base-ui-portal')).toBe('');
		expect(portal.dataset.attached).toBe('yes');
		expect(portal.dataset.attachedInBody).toBe('yes');
		expect(portal.parentElement).toBe(document.body);
		expect(portal.querySelector('[role="dialog"]')).not.toBeNull();
	});

	it('does not mount while container is null', async () => {
		const view = render(PortalContainerHarness, { part: 'popover' });
		await tick();
		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => resolve());
		});

		expect(document.querySelector('[data-slot="popover-portal"]')).toBeNull();
		expect(document.body.querySelector('[role="dialog"]')).toBeNull();

		await view.rerender({ part: 'popover', provide: true });
		const holder = document.querySelector('[data-testid="portal-holder"]');
		await expect
			.poll(() => document.querySelector('[data-slot="popover-portal"]')?.parentElement)
			.toBe(holder);
		expect(document.querySelector('[data-slot="popover-portal"] [role="dialog"]')).not.toBeNull();
	});

	it('ignores a stray store prop on the portal', async () => {
		const stray = { portalElement: null as HTMLElement | null };
		render(PortalHostHarness, { part: 'popover', stray });

		await expect.poll(() => document.querySelector('[data-slot="popover-portal"]')).not.toBeNull();
		const portal = document.querySelector('[data-slot="popover-portal"]');
		if (!(portal instanceof HTMLDivElement)) throw new Error('portal is not a div');

		expect(stray.portalElement).toBeNull();
		expect(portal.parentElement).toBe(document.body);
		expect(portal.querySelector('[role="dialog"]')).not.toBeNull();
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

	it('lets onOpenChangeComplete write $state when the popover opens', async () => {
		// Completion runs inside the effect when animations are skipped. A tracked
		// callback that writes `$state` then exceeds the update depth.
		const view = globalThis as { BASE_UI_ANIMATIONS_DISABLED?: boolean };
		const previous = view.BASE_UI_ANIMATIONS_DISABLED;
		view.BASE_UI_ANIMATIONS_DISABLED = true;
		try {
			render(PopoverOpenCompleteStateHarness);
			await page.getByRole('button', { name: 'Open' }).click();
			await expect.poll(() => page.getByTestId('completions').element().textContent).toBe('true');
		} finally {
			view.BASE_UI_ANIMATIONS_DISABLED = previous;
		}
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

	it('starts the next viewport pane from that trigger’s own state', async () => {
		render(PopoverReviewHarness, { mode: 'viewport' });
		await page.getByRole('button', { name: 'One' }).click();
		const note = page.getByTestId('pane-note').element();
		const radio = page.getByTestId('live-radio').element();
		if (!(note instanceof HTMLInputElement) || !(radio instanceof HTMLInputElement)) {
			throw new Error('missing pane controls');
		}
		note.value = 'from-a';
		note.dispatchEvent(new Event('input', { bubbles: true }));
		radio.click();
		await expect
			.poll(() => document.querySelector('[data-current] [data-testid=pane-state]')?.textContent)
			.toBe('from-a|true');
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
		const currentNote = document.querySelector('[data-current] [data-testid=pane-note]');
		const currentRadio = document.querySelector('[data-current] [data-testid=live-radio]');
		const copied = previous?.querySelector('input[type="radio"]');
		if (
			!(currentNote instanceof HTMLInputElement) ||
			!(currentRadio instanceof HTMLInputElement) ||
			!(copied instanceof HTMLInputElement)
		) {
			throw new Error('missing radios');
		}
		expect(currentNote.value).toBe('');
		expect(currentRadio.checked).toBe(false);
		expect(document.querySelector('[data-current] [data-testid=pane-state]')?.textContent).toBe(
			'|false'
		);
		expect(copied.hasAttribute('name')).toBe(false);
		await page.getByRole('button', { name: 'One' }).click();
		await expect
			.poll(() => document.querySelector('[data-current] [data-testid=pane-text]')?.textContent)
			.toBe('content-AAA');
		const restoredNote = document.querySelector('[data-current] [data-testid=pane-note]');
		const restoredRadio = document.querySelector('[data-current] [data-testid=live-radio]');
		if (
			!(restoredNote instanceof HTMLInputElement) ||
			!(restoredRadio instanceof HTMLInputElement)
		) {
			throw new Error('missing restored controls');
		}
		expect(restoredNote.value).toBe('from-a');
		expect(restoredRadio.checked).toBe(true);
		expect(document.querySelector('[data-current] [data-testid=pane-state]')?.textContent).toBe(
			'from-a|true'
		);
	});

	it('keeps the current pane and its focus when the open trigger payload changes', async () => {
		const view = render(PopoverReviewHarness, { mode: 'viewport', payloadA: 'content-AAA' });
		await page.getByRole('button', { name: 'One' }).click();
		const pane = document.querySelector('[data-current]');
		const input = document.querySelector('[data-current] [data-testid=live-input]');
		if (!(pane instanceof HTMLElement) || !(input instanceof HTMLInputElement)) {
			throw new Error('missing pane');
		}
		input.focus();
		expect(document.activeElement).toBe(input);
		await view.rerender({ mode: 'viewport', payloadA: 'content-AAA-next' });
		await expect
			.poll(() => document.querySelector('[data-current] [data-testid=pane-text]')?.textContent)
			.toBe('content-AAA-next');
		expect(document.querySelector('[data-current]')).toBe(pane);
		expect(document.activeElement).toBe(input);
	});

	it('leaves focus on the clicked trigger when the viewport switches', async () => {
		render(PopoverReviewHarness, { mode: 'viewport' });
		await page.getByRole('button', { name: 'One' }).click();
		await expect
			.poll(() => document.activeElement)
			.toBe(document.querySelector('[data-current] [data-testid=live-input]'));
		const two = page.getByRole('button', { name: 'Two' }).element();
		await page.getByRole('button', { name: 'Two' }).click();
		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
		});
		expect(document.activeElement).toBe(two);
	});

	it('moves focus to the popup when a trigger switch removes the focused control', async () => {
		const handle = Popover.createHandle();
		render(PopoverReviewHarness, { mode: 'viewport', handle });
		await page.getByRole('button', { name: 'One' }).click();
		const input = document.querySelector('[data-current] [data-testid=live-input]');
		if (!(input instanceof HTMLInputElement)) throw new Error('missing input');
		input.focus();
		expect(document.activeElement).toBe(input);
		handle.open('trigger-b');
		const popup = page.getByRole('dialog').element();
		await expect.poll(() => document.activeElement).toBe(popup);
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

	it('does not open from hover after the root unmounts', async () => {
		const view = render(PopoverDetachHarness, { mode: 'lifecycle', rootMounted: true, delay: 0 });
		const trigger = page.getByRole('button', { name: 'Open' });
		const away = page.getByRole('button', { name: 'Away' });
		await trigger.hover();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		await away.hover();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
		await view.rerender({ mode: 'lifecycle', rootMounted: false, delay: 0 });
		await trigger.hover();
		await expect.poll(() => page.getByRole('dialog').elements().length).toBe(0);
		await away.hover();
		await view.rerender({ mode: 'lifecycle', rootMounted: true, delay: 0 });
		await trigger.hover();
		await expect.element(page.getByRole('dialog')).toBeVisible();
		view.unmount();
	});

	it('does not mark copied controls disabled during the cross-fade', async () => {
		const view = render(PopoverDetachHarness, { mode: 'form' });
		try {
			await page.getByRole('button', { name: 'One' }).click();
			await expect.element(page.getByTestId('live-input')).toHaveValue('AAA');
			let disabled: boolean | null = null;
			const observer = new MutationObserver(() => {
				const copied = document.querySelector('[data-previous] input');
				if (!(copied instanceof HTMLInputElement) || !copied.isConnected) return;
				disabled = copied.matches(':disabled');
			});
			observer.observe(document.body, { childList: true, subtree: true });
			await page.getByRole('button', { name: 'Two' }).click();
			await expect.poll(() => disabled).not.toBeNull();
			observer.disconnect();
			expect(disabled).toBe(false);
		} finally {
			view.unmount();
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

	it('keeps the previous pane for the opacity cross-fade', async () => {
		const style = document.createElement('style');
		style.textContent =
			'[data-current]{transition:opacity 2500ms}[data-current][data-starting-style]{opacity:0}';
		document.head.append(style);
		try {
			render(PopoverReviewHarness, { mode: 'viewport' });
			await page.getByRole('button', { name: 'One' }).click();
			await expect
				.poll(() => document.querySelector('[data-current] [data-testid=pane-text]')?.textContent)
				.toBe('content-AAA');
			await page.getByRole('button', { name: 'Two' }).click();
			await expect.poll(() => document.querySelector('[data-previous]')).toBeTruthy();
			await new Promise((resolve) => setTimeout(resolve, 2000));
			expect(document.querySelector('[data-previous]')).toBeTruthy();
			expect(document.querySelector('[data-current] [data-testid=pane-text]')?.textContent).toBe(
				'content-BBB'
			);
		} finally {
			style.remove();
		}
	});

	it('lets the form submit while an empty required copy is cross-fading', async () => {
		const view = render(PopoverDetachHarness, {
			mode: 'form',
			portalIntoForm: true,
			requiredCopy: true
		});
		try {
			await page.getByRole('button', { name: 'One' }).click();
			await expect.element(page.getByTestId('live-input')).toHaveValue('AAA');
			const form = page.getByTestId('hosted-form').element();
			if (!(form instanceof HTMLFormElement)) throw new Error('missing form');
			let submitted = false;
			let invalid = false;
			const onSubmit = (event: Event) => {
				event.preventDefault();
				submitted = true;
			};
			const onInvalid = () => {
				invalid = true;
			};
			form.addEventListener('submit', onSubmit);
			form.addEventListener('invalid', onInvalid, true);
			let sawPrevious = false;
			const observer = new MutationObserver(() => {
				if (sawPrevious) return;
				const previous = document.querySelector('[data-previous]');
				if (!(previous instanceof HTMLElement) || !previous.isConnected) return;
				const copied = previous.querySelector('input[required]');
				if (!(copied instanceof HTMLInputElement) || !copied.isConnected) return;
				sawPrevious = true;
				form.requestSubmit();
			});
			observer.observe(document.body, { childList: true, subtree: true, attributes: true });
			await page.getByRole('button', { name: 'Two' }).click();
			await expect.poll(() => submitted).toBe(true);
			expect(invalid).toBe(false);
			expect(sawPrevious).toBe(true);
			observer.disconnect();
			form.removeEventListener('submit', onSubmit);
			form.removeEventListener('invalid', onInvalid, true);
		} finally {
			view.unmount();
		}
	});
});

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
