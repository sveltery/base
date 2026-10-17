// Base UI merges each part handler with the consumer's through `mergeProps`, so a consumer's
// `preventBaseUIHandler()` skips the part's own handler. Here that signal is `preventDefault()`.
// `scripts/check-handler-prevention.mjs` lists the handlers these cases cover.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PreventedHandlerHarness from '../../tests/PreventedHandlerHarness.svelte';

const prevent = (event: Event) => event.preventDefault();

function after() {
	return page.getByRole('button', { name: 'After' });
}

function otpSlots() {
	return page.getByRole('textbox').elements() as HTMLInputElement[];
}

describe('a consumer handler that calls preventDefault skips the part handler', () => {
	for (const [part, role] of [
		['checkbox', 'checkbox'],
		['switch', 'switch']
	] as const) {
		it(`${part} onfocus leaves the field unfocused`, async () => {
			render(PreventedHandlerHarness, { part, handlers: { onfocus: prevent } });
			await userEvent.click(page.getByRole(role));
			await expect.element(page.getByRole(role)).toHaveFocus();
			await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-focused');
		});

		it(`${part} onblur leaves the field untouched`, async () => {
			render(PreventedHandlerHarness, { part, handlers: { onblur: prevent } });
			await userEvent.click(page.getByRole(role));
			await userEvent.click(after());
			await expect.element(after()).toHaveFocus();
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-focused');
			await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-touched');
		});
	}

	it('radio onblur keeps the field focused', async () => {
		render(PreventedHandlerHarness, { part: 'lone-radio', handlers: { onblur: prevent } });
		await userEvent.click(page.getByRole('radio'));
		await userEvent.click(after());
		await expect.element(after()).toHaveFocus();
		await expect.element(page.getByTestId('field')).toHaveAttribute('data-focused');
	});

	it('radio group onfocusout leaves the field untouched', async () => {
		render(PreventedHandlerHarness, { part: 'radio-group', handlers: { onfocusout: prevent } });
		await userEvent.click(page.getByRole('radio'));
		await userEvent.click(after());
		await expect.element(after()).toHaveFocus();
		await expect.element(page.getByTestId('field')).toHaveAttribute('data-focused');
		await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-touched');
	});

	it('field label onclick leaves the control unfocused', async () => {
		render(PreventedHandlerHarness, { part: 'label', handlers: { onclick: prevent } });
		await userEvent.click(page.getByText('Email'));
		await expect.element(page.getByTestId('control')).not.toHaveFocus();
	});

	it('OTP input oncompositionstart lets each composing input commit', async () => {
		const onValueChange = vi.fn();
		render(PreventedHandlerHarness, {
			part: 'otp',
			onValueChange,
			handlers: { oncompositionstart: prevent }
		});
		const [slot] = otpSlots();
		slot.focus();
		slot.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		slot.value = '1';
		slot.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
		expect(onValueChange.mock.lastCall?.[0]).toBe('1');
	});

	it('OTP input oncompositionend skips the composition commit and ends it', async () => {
		const onValueChange = vi.fn();
		render(PreventedHandlerHarness, {
			part: 'otp',
			onValueChange,
			handlers: { oncompositionend: prevent }
		});
		const [slot] = otpSlots();
		slot.focus();
		slot.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		slot.value = '1';
		slot.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
		slot.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '1' }));
		expect(onValueChange).not.toHaveBeenCalled();
		slot.value = '2';
		slot.dispatchEvent(new InputEvent('input', { bubbles: true }));
		expect(onValueChange.mock.lastCall?.[0]).toBe('2');
	});

	it('scrub area onclickcapture still records the native click, so no second click follows', async () => {
		const onclick = vi.fn();
		render(PreventedHandlerHarness, {
			part: 'scrub',
			handlers: { onclickcapture: prevent, onclick }
		});
		const area = page.getByTestId('scrub').element();
		// A touch press takes no pointer lock, so the native click reaches the scrub area.
		const press = { bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: true };
		area.dispatchEvent(new PointerEvent('pointerdown', press));
		await new Promise((resolve) => setTimeout(resolve, 0));
		area.dispatchEvent(new PointerEvent('pointerup', press));
		area.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		// The synthesized click waits one task, and Firefox adds 20ms before it.
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(onclick).toHaveBeenCalledTimes(1);
	});

	it('composite item onfocus keeps the roving tab stop where it was', async () => {
		render(PreventedHandlerHarness, { part: 'tabs', handlers: { onfocus: prevent } });
		(page.getByRole('tab', { name: 'Two' }).element() as HTMLElement).focus();
		await expect.element(page.getByRole('tab', { name: 'Two' })).toHaveFocus();
		await expect.element(page.getByRole('tab', { name: 'Two' })).toHaveAttribute('tabindex', '-1');
		await expect.element(page.getByRole('tab', { name: 'One' })).toHaveAttribute('tabindex', '0');
	});
});
