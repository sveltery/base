// Assertions follow Base UI v1.8.0 packages/react/src/number-field/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Cases from upstream commit 7d93b487f follow v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// describeConformance, ref, inputRef, and className callbacks are not ported.
import { tick } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NumberFieldHarness from '../../tests/NumberFieldHarness.svelte';
import PreventedHandlerHarness from '../../tests/PreventedHandlerHarness.svelte';
import RemoteControlHarness from '../../tests/RemoteControlHarness.svelte';
import { kitFields } from '../../tests/kit-fields.js';

function control() {
	return page.getByTestId('control');
}

function increase() {
	return page.getByRole('button', { name: 'Increase' });
}

function decrease() {
	return page.getByRole('button', { name: 'Decrease' });
}

function holdIncrease() {
	increase()
		.element()
		.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'mouse' }));
}

function hiddenNumber(name = 'qty') {
	const input = document.querySelector(`input[type="number"][name="${name}"]`);
	if (!(input instanceof HTMLInputElement)) throw new Error('expected a hidden number input');
	return input;
}

/** Lets the queued `input` and `change` events fire. */
function settle() {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * A native `input` or `change` handler for the hidden number input that records the value at
 * each event. `then` runs with that value.
 */
function valueEvents(then?: (value: number | null) => void) {
	const values: (number | null)[] = [];
	const spy = vi.fn((event: Event) => {
		const input = event.currentTarget as HTMLInputElement;
		const value = input.value === '' ? null : input.valueAsNumber;
		values.push(value);
		then?.(value);
	});
	return Object.assign(spy, { values });
}

/** How many times the harness's `validate` ran. */
const calls = () => Number(page.getByTestId('calls').element().textContent);

/** The count once the mount's constraint-gate runs are done. */
async function settledCalls() {
	await tick();
	await new Promise((resolve) => setTimeout(resolve, 0));
	return calls();
}

describe('<NumberField />', () => {
	it('clears errors, revalidates, and marks dirty when the parent changes the value', async () => {
		render(NumberFieldHarness, { scenario: 'parent' });
		await expect.element(page.getByTestId('errors')).toHaveTextContent('{"qty":"stale"}');
		await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-dirty');
		await page.getByRole('button', { name: 'Set nine' }).click();
		await expect.element(page.getByTestId('errors')).toHaveTextContent('{}');
		await expect.element(page.getByTestId('field')).toHaveAttribute('data-dirty', '');
		await expect.element(page.getByTestId('error')).toHaveTextContent('nope');
		expect(page.getByTestId('seen').element().textContent).toBe(
			JSON.stringify({ value: 9, form: 9, input: '9' })
		);
	});

	it('submits the value after a change, not the registered snapshot', async () => {
		render(NumberFieldHarness, { scenario: 'submit-changed' });
		await userEvent.click(increase().element());
		await expect.element(control()).toHaveValue('0');
		await userEvent.click(page.getByRole('button', { name: 'Submit' }).element());
		await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
		expect(page.getByTestId('seen').element().textContent).toBe(
			JSON.stringify({ value: 0, form: 0 })
		);
	});

	it('runs field validation once when autofill fires a change event', async () => {
		render(NumberFieldHarness, { scenario: 'autofill' });
		const before = await settledCalls();
		const hidden = hiddenNumber();
		hidden.value = '9';
		hidden.dispatchEvent(new Event('input', { bubbles: true }));
		hidden.dispatchEvent(new Event('change', { bubbles: true }));
		await expect.poll(calls).toBe(before + 1);
	});

	it('updates the value and validates when autofill fires only a change event', async () => {
		render(NumberFieldHarness, { scenario: 'autofill' });
		const before = await settledCalls();
		const hidden = hiddenNumber();
		hidden.value = '9';
		hidden.dispatchEvent(new Event('change', { bubbles: true }));
		await expect.element(control()).toHaveValue('9');
		await expect.poll(calls).toBe(before + 1);
	});

	it('does not validate when autofill repeats the current value', async () => {
		render(NumberFieldHarness, { scenario: 'autofill' });
		const before = await settledCalls();
		const hidden = hiddenNumber();
		expect(hidden.value).toBe('4');
		hidden.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();
		expect(calls()).toBe(before);
		expect(hidden.value).toBe('4');
	});

	it('validates the stepped value after the input and registration update', async () => {
		render(NumberFieldHarness, { scenario: 'step' });
		await userEvent.click(increase().element());
		await expect.element(control()).toHaveValue('5');
		expect(page.getByTestId('seen').element().textContent).toBe(
			JSON.stringify({ value: 5, form: 5, input: '5' })
		);
	});

	it('applies a hidden input event without a change event', async () => {
		const oninput = valueEvents();
		render(NumberFieldHarness, { scenario: 'plain', oninput });
		const hidden = document.querySelector('input[type="number"]');
		if (!(hidden instanceof HTMLInputElement)) throw new Error('expected a hidden number input');
		hidden.value = '9';
		hidden.dispatchEvent(new Event('input', { bubbles: true }));
		expect(oninput).toHaveBeenCalledTimes(1);
		expect(oninput.values.at(-1)).toBe(9);
		await expect.element(control()).toHaveValue('9');
	});

	it('renders the input, steppers, and group', async () => {
		render(NumberFieldHarness, { scenario: 'plain' });

		await expect.element(control()).toHaveValue('4');
		await expect.element(increase()).toHaveAttribute('aria-label', 'Increase');
		await expect.element(decrease()).toHaveAttribute('aria-label', 'Decrease');
		await expect.element(increase()).toHaveAttribute('tabindex', '-1');
		await expect.element(page.getByTestId('group')).toHaveAttribute('role', 'group');
		expect(increase().element().getAttribute('aria-controls')).toBe(control().element().id);
		expect(control().element().getAttribute('aria-roledescription')).toBe('Number field');
	});

	it('repeats a held increment until the pointer is released', async () => {
		const onchange = valueEvents();
		const oninput = valueEvents((value) => {
			if (value !== 6) return;
			// Release after the tick that reached 6 finishes and before the next one, as a user would.
			queueMicrotask(() =>
				increase()
					.element()
					.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }))
			);
		});
		render(NumberFieldHarness, { scenario: 'plain', oninput, onchange });
		holdIncrease();
		await expect.element(control()).toHaveValue('6');
		await new Promise((resolve) => setTimeout(resolve, 180));
		expect(oninput.values).toEqual([5, 6]);
		expect(onchange.values).toEqual([6]);
	});

	it('stops a held increment when the field unmounts', async () => {
		const oninput = valueEvents();
		const view = render(NumberFieldHarness, { scenario: 'plain', oninput });
		holdIncrease();
		await expect.poll(() => oninput.mock.calls.length).toBeGreaterThan(1);
		view.unmount();
		const callsAtUnmount = oninput.mock.calls.length;
		await new Promise((resolve) => setTimeout(resolve, 180));
		expect(document.querySelector('[data-testid="control"]')).toBeNull();
		expect(oninput.mock.calls.length).toBe(callsAtUnmount);
	});

	it('steps up and down from a click', async () => {
		const oninput = valueEvents();
		const onchange = valueEvents();
		render(NumberFieldHarness, { scenario: 'plain', oninput, onchange });

		await userEvent.click(increase().element());
		await expect.element(control()).toHaveValue('5');
		expect(oninput).toHaveBeenCalled();
		expect(oninput.values.at(-1)).toBe(5);
		expect(onchange.values.at(-1)).toBe(5);

		await userEvent.click(decrease().element());
		await expect.element(control()).toHaveValue('4');
	});

	it('seeds an empty field at 0 when increased', async () => {
		render(NumberFieldHarness, { scenario: 'empty' });
		await userEvent.click(increase().element());
		await expect.element(control()).toHaveValue('0');
	});

	it('writes the first step into an empty bind', async () => {
		render(NumberFieldHarness, { scenario: 'loose' });
		await expect.element(page.getByTestId('value')).toHaveTextContent('none');
		await userEvent.click(increase().element());
		await expect.element(control()).toHaveValue('0');
		await expect.element(page.getByTestId('value')).toHaveTextContent('0');
	});

	it('keeps a bound value in sync', async () => {
		render(NumberFieldHarness, { scenario: 'bound' });
		await expect.element(page.getByTestId('value')).toHaveTextContent('4');
		await userEvent.click(increase().element());
		await expect.element(control()).toHaveValue('5');
		await expect.element(page.getByTestId('value')).toHaveTextContent('5');
	});

	it('types a number and commits it on blur', async () => {
		const onchange = valueEvents();
		render(NumberFieldHarness, { scenario: 'plain', onchange });
		const input = control().element() as HTMLInputElement;
		input.focus();
		await userEvent.fill(input, '12');
		input.blur();
		await expect.element(control()).toHaveValue('12');
		expect(onchange.values.at(-1)).toBe(12);
	});

	it('steps with ArrowUp and ArrowDown', async () => {
		render(NumberFieldHarness, { scenario: 'plain' });
		(control().element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect.element(control()).toHaveValue('5');
		await userEvent.keyboard('{ArrowDown}');
		await expect.element(control()).toHaveValue('4');
	});

	it('jumps to min and max with Home and End', async () => {
		render(NumberFieldHarness, { scenario: 'bounds' });
		(control().element() as HTMLElement).focus();
		await userEvent.keyboard('{Home}');
		await expect.element(control()).toHaveValue('0');
		await userEvent.keyboard('{End}');
		await expect.element(control()).toHaveValue('5');
	});

	it('disables the input and the steppers from the root', async () => {
		render(NumberFieldHarness, { scenario: 'disabled' });
		await expect.element(control()).toBeDisabled();
		await expect.element(page.getByTestId('root')).toHaveAttribute('data-disabled', '');
		await expect.element(increase()).toHaveAttribute('disabled');
		increase()
			.element()
			.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' })
			);
		await expect.element(control()).toHaveValue('4');
	});

	it('sets the disabled attribute on a disabled increment and does not step', async () => {
		const oninput = valueEvents();
		render(NumberFieldHarness, { scenario: 'increment-disabled', oninput });
		await expect.element(increase()).toHaveAttribute('disabled');
		increase()
			.element()
			.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' })
			);
		expect(oninput).not.toHaveBeenCalled();
		await expect.element(control()).toHaveValue('0');
	});

	it('marks a read-only input with aria-readonly and its steppers with aria-disabled', async () => {
		render(NumberFieldHarness, { scenario: 'readonly' });
		// Not `readonly`, which would take the input out of constraint validation.
		await expect.element(control()).toHaveAttribute('aria-readonly', 'true');
		await expect.element(control()).not.toHaveAttribute('readonly');
		await expect.element(increase()).toHaveAttribute('aria-disabled', 'true');
		await expect.element(increase()).not.toHaveAttribute('disabled');
		await expect.element(increase()).not.toHaveAttribute('aria-readonly');
		await expect.element(decrease()).not.toHaveAttribute('aria-readonly');
		increase()
			.element()
			.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' })
			);
		await expect.element(control()).toHaveValue('4');
	});

	it('reverts typing in a read-only input', async () => {
		const oninput = valueEvents();
		render(NumberFieldHarness, { scenario: 'readonly', oninput });
		const input = control().element() as HTMLInputElement;
		input.value = '7';
		input.dispatchEvent(new InputEvent('input', { bubbles: true, data: '7' }));
		await expect.element(control()).toHaveValue('4');
		await settle();
		expect(oninput).not.toHaveBeenCalled();
	});

	it('marks the input required and names the hidden number input', async () => {
		render(NumberFieldHarness, { scenario: 'required' });
		await expect.element(control()).toHaveAttribute('required');
		expect(hiddenNumber().required).toBe(true);
		expect(hiddenNumber().name).toBe('qty');
	});

	it('submits the raw number, not the formatted text', async () => {
		render(NumberFieldHarness, { scenario: 'format' });
		await expect.element(control()).not.toHaveValue('54.5');
		expect(hiddenNumber('price').value).toBe('54.5');
	});

	it('disables increment at max and still allows a typed out-of-range value', async () => {
		render(NumberFieldHarness, { scenario: 'bounds' });
		await expect.element(increase()).toHaveAttribute('disabled');
		await userEvent.click(decrease().element());
		await expect.element(control()).toHaveValue('4');
	});

	it('lets typed text exceed max when allowOutOfRange is set', async () => {
		const oninput = valueEvents();
		render(NumberFieldHarness, { scenario: 'out-of-range', oninput });
		const input = control().element() as HTMLInputElement;
		input.focus();
		await userEvent.fill(input, '9');
		expect(oninput.values.at(-1)).toBe(9);
		await expect.element(control()).toHaveValue('9');
		await expect.element(increase()).toHaveAttribute('disabled');
		await userEvent.click(decrease().element());
		await expect.element(control()).toHaveValue('5');
	});

	it('reports an out-of-range value to Field when allowOutOfRange is set', async () => {
		render(NumberFieldHarness, { scenario: 'field-out-of-range' });
		const input = control().element() as HTMLInputElement;
		input.focus();
		await userEvent.fill(input, '9');
		await expect.element(page.getByText('too large')).toBeVisible();
		await expect.element(control()).toHaveAttribute('data-invalid', '');
		await userEvent.fill(input, '-1');
		await expect.element(page.getByText('too small')).toBeVisible();
		await userEvent.fill(input, '3');
		await expect.element(control()).toHaveAttribute('data-valid', '');
	});

	it('pastes a number over the selection', async () => {
		const oninput = valueEvents();
		render(NumberFieldHarness, { scenario: 'paste', oninput });
		const input = control().element() as HTMLInputElement;
		input.focus();
		input.select();
		const data = new DataTransfer();
		data.setData('text/plain', '20');
		input.dispatchEvent(
			new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })
		);
		await expect.element(control()).toHaveValue('20');
		await settle();
		expect(oninput.values).toEqual([20]);
	});

	it('warns and keeps the value when the clipboard cannot be read', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const oninput = valueEvents();
		render(NumberFieldHarness, { scenario: 'paste', oninput });
		const input = control().element() as HTMLInputElement;
		const before = input.value;
		const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
		Object.defineProperty(event, 'clipboardData', {
			get() {
				throw new Error('blocked');
			}
		});
		input.dispatchEvent(event);
		expect(warn).toHaveBeenCalledWith(
			'Base UI: <NumberField.Input> could not read clipboard text during paste handling.'
		);
		expect(event.defaultPrevented).toBe(false);
		expect(oninput).not.toHaveBeenCalled();
		expect(input.value).toBe(before);
		warn.mockRestore();
	});

	it('changes the focused value from the wheel and commits it', async () => {
		const oninput = valueEvents();
		const onchange = valueEvents();
		render(NumberFieldHarness, {
			scenario: 'wheel',
			oninput,
			onchange
		});
		const input = control().element() as HTMLInputElement;
		input.focus();
		input.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, cancelable: true, bubbles: true }));
		await expect.element(control()).toHaveValue('11');
		expect(oninput.values.at(-1)).toBe(11);
		expect(onchange.values.at(-1)).toBe(11);
	});

	it('associates a field label and marks the value filled', async () => {
		render(NumberFieldHarness, { scenario: 'field' });
		const input = control();
		expect(input.element().id).toMatch(/^base-ui-/);
		await expect.element(page.getByTestId('label')).toHaveAttribute('for', input.element().id);
		await expect.element(page.getByRole('textbox', { name: 'Amount' })).toBeVisible();
		await expect.element(page.getByTestId('field')).toHaveAttribute('data-filled', '');
		await expect.element(input).toHaveAttribute('data-filled', '');
	});

	it('blocks submit and shows the required error', async () => {
		render(NumberFieldHarness, { scenario: 'form-required' });
		await expect.element(page.getByTestId('error')).not.toBeInTheDocument();
		await userEvent.click(page.getByRole('button', { name: 'Submit' }).element());
		await expect.element(page.getByText('Required')).toBeVisible();
		await expect.element(page.getByTestId('submitted')).toHaveTextContent('0');
		await expect.element(control()).toHaveAttribute('aria-invalid', 'true');
	});

	it('includes the hidden input value in a native form submit', async () => {
		render(NumberFieldHarness, { scenario: 'form-values' });
		const hidden = hiddenNumber();
		expect(hidden.value).toBe('54.5');
		expect(hidden.name).toBe('qty');
		const form = hidden.form;
		expect(form).toBeInstanceOf(HTMLFormElement);
		const entries = [...new FormData(form!).entries()];
		expect(entries).toEqual([['qty', '54.5']]);
	});

	it('forwards render props and state', async () => {
		render(NumberFieldHarness, { scenario: 'render' });
		await expect.element(page.getByTestId('root')).toHaveAttribute('data-rendered', 'true');
		await expect.element(page.getByTestId('root')).toHaveAttribute('data-value', '1');
	});

	it('skips the stepper when the consumer preventDefault runs', async () => {
		render(NumberFieldHarness, { scenario: 'prevent' });
		increase()
			.element()
			.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' })
			);
		await expect.element(control()).toHaveValue('1');
	});

	it('throws when a part is rendered outside the root', async () => {
		await expect(async () => {
			render(NumberFieldHarness, { scenario: 'orphan' });
		}).rejects.toThrow(/NumberFieldRootContext is missing/);
	});

	it('throws when the cursor is rendered outside the scrub area', async () => {
		await expect(async () => {
			render(NumberFieldHarness, { scenario: 'orphan-cursor' });
		}).rejects.toThrow(/NumberFieldScrubAreaContext is missing/);
	});

	// A real lock can land before or after the release, and headless Chromium grants it with a
	// pointermove that scrubs the value. So each test fixes which side of the race it covers.
	describe('scrub area click without scrubbing', () => {
		async function clickScrubArea() {
			const onScrubClick = vi.fn<(event: MouseEvent) => void>();
			render(NumberFieldHarness, { scenario: 'scrub-click', onScrubClick });
			await userEvent.click(page.getByTestId('scrub'));
			// The synthesized click waits one task, and Firefox adds 20ms before it.
			await new Promise((resolve) => setTimeout(resolve, 50));
			return onScrubClick;
		}

		it('fires onclick once when the native click reaches the area', async () => {
			const lock = vi
				.spyOn(Element.prototype, 'requestPointerLock')
				.mockRejectedValue(new DOMException('denied', 'NotAllowedError'));
			onTestFinished(() => lock.mockRestore());
			const onScrubClick = await clickScrubArea();
			expect(onScrubClick).toHaveBeenCalledTimes(1);
			expect(onScrubClick.mock.calls[0][0].isTrusted).toBe(true);
		});

		it('fires onclick once when the pointer lock takes the native click', async () => {
			const lock = vi
				.spyOn(Element.prototype, 'requestPointerLock')
				.mockResolvedValue(undefined as never);
			// A locked pointer sends its click to the lock element, so the area never sees it.
			const takeClick = (event: MouseEvent) => {
				if (event.isTrusted) event.stopImmediatePropagation();
			};
			window.addEventListener('click', takeClick, true);
			onTestFinished(() => {
				window.removeEventListener('click', takeClick, true);
				lock.mockRestore();
			});
			const onScrubClick = await clickScrubArea();
			expect(onScrubClick).toHaveBeenCalledTimes(1);
			expect(onScrubClick.mock.calls[0][0].isTrusted).toBe(false);
		});
	});

	describe('scrub area', () => {
		let lock: { mockRestore: () => void };

		beforeEach(() => {
			lock = vi
				.spyOn(Element.prototype, 'requestPointerLock')
				.mockResolvedValue(undefined as never);
		});

		afterEach(() => {
			lock.mockRestore();
		});

		it('changes the value while dragging and shows the cursor', async () => {
			const oninput = valueEvents();
			render(NumberFieldHarness, { scenario: 'scrub', oninput });
			const area = page.getByTestId('scrub').element();
			area.dispatchEvent(
				new PointerEvent('pointerdown', {
					bubbles: true,
					cancelable: true,
					pointerType: 'mouse',
					clientX: 20,
					clientY: 20
				})
			);
			await expect.element(page.getByTestId('root')).toHaveAttribute('data-scrubbing', '');
			await expect.element(page.getByTestId('cursor')).toBeVisible();
			window.dispatchEvent(
				new PointerEvent('pointermove', {
					bubbles: true,
					cancelable: true,
					movementX: 5,
					movementY: 0
				})
			);
			await expect.element(control()).toHaveValue('5');
			window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
			await expect.element(page.getByTestId('root')).not.toHaveAttribute('data-scrubbing');
		});

		it('moves the cursor and blocks a single touch on a rendered scrub area', async () => {
			render(NumberFieldHarness, { scenario: 'scrub-render' });
			const area = page.getByTestId('scrub').element();
			const touch = new TouchEvent('touchstart', { bubbles: true, cancelable: true });
			Object.defineProperty(touch, 'touches', { value: [{ clientX: 0, clientY: 0 }] });
			area.dispatchEvent(touch);
			expect(touch.defaultPrevented).toBe(true);

			area.dispatchEvent(
				new PointerEvent('pointerdown', {
					bubbles: true,
					cancelable: true,
					pointerType: 'mouse',
					clientX: 20,
					clientY: 20
				})
			);
			const cursor = page.getByTestId('cursor');
			await expect.element(cursor).toBeVisible();
			window.dispatchEvent(
				new PointerEvent('pointermove', {
					bubbles: true,
					cancelable: true,
					movementX: 5,
					movementY: 0
				})
			);
			await expect.element(control()).toHaveValue('5');
			expect((cursor.element() as HTMLElement).style.transform).toBe(
				'translate3d(20px, 15px, 0px) scale(1)'
			);
			window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
		});

		it('blocks a single touch and leaves a second touch alone', async () => {
			render(NumberFieldHarness, { scenario: 'scrub-touch' });
			const area = page.getByTestId('scrub').element();
			const one = new TouchEvent('touchstart', { bubbles: true, cancelable: true });
			Object.defineProperty(one, 'touches', { value: [{ clientX: 0, clientY: 0 }] });
			area.dispatchEvent(one);
			expect(one.defaultPrevented).toBe(true);

			const two = new TouchEvent('touchstart', { bubbles: true, cancelable: true });
			Object.defineProperty(two, 'touches', {
				value: [
					{ clientX: 0, clientY: 0 },
					{ clientX: 1, clientY: 1 }
				]
			});
			area.dispatchEvent(two);
			expect(two.defaultPrevented).toBe(false);
		});
	});
});

describe('NumberField consumer preventDefault', () => {
	const prevent = (event: Event) => event.preventDefault();

	it('skips marking the field focused when onfocus calls preventDefault', async () => {
		render(PreventedHandlerHarness, { part: 'number', handlers: { onfocus: prevent } });
		await userEvent.click(control());
		await expect.element(control()).toHaveFocus();
		await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-focused');
	});

	it('skips the blur commit when onblur calls preventDefault', async () => {
		const onchange = valueEvents();
		render(PreventedHandlerHarness, {
			part: 'number',
			onchange,
			handlers: { onblur: prevent }
		});
		await userEvent.type(control(), '5');
		await userEvent.tab();
		await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus();
		expect(onchange.mock.calls.length).toBe(0);
		await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-touched');
	});

	it('skips the value change when oninput calls preventDefault', async () => {
		const oninput = valueEvents();
		render(PreventedHandlerHarness, {
			part: 'number',
			oninput,
			handlers: { oninput: prevent }
		});
		await userEvent.type(control(), '5');
		expect([hiddenNumber().value, oninput.mock.calls.length]).toEqual(['', 0]);
	});

	it('keeps a held increment running when onmouseleave calls preventDefault', async () => {
		const oninput = valueEvents((value) => {
			if (value === 4) {
				window.dispatchEvent(
					new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' })
				);
			}
		});
		render(PreventedHandlerHarness, {
			part: 'number',
			oninput,
			stepperHandlers: { onmouseleave: prevent }
		});
		await userEvent.hover(increase());
		holdIncrease();
		await userEvent.hover(control());
		await expect.element(control()).toHaveValue('4');
		expect(oninput.values).toEqual([0, 1, 2, 3, 4]);
	});

	it('keeps a held increment stopped when the mouse re-enters after onmouseenter called preventDefault', async () => {
		const oninput = valueEvents();
		render(PreventedHandlerHarness, {
			part: 'number',
			oninput,
			stepperHandlers: { onmouseenter: prevent }
		});
		await userEvent.hover(increase());
		holdIncrease();
		await userEvent.hover(control());
		await userEvent.hover(increase());
		await new Promise((resolve) => setTimeout(resolve, 600));
		expect(oninput.values).toEqual([0]);
		window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }));
	});

	it('stops a held increment when the mouse leaves after ontouchstart called preventDefault', async () => {
		const oninput = valueEvents();
		render(PreventedHandlerHarness, {
			part: 'number',
			oninput,
			stepperHandlers: { ontouchstart: prevent }
		});
		await userEvent.hover(increase());
		holdIncrease();
		increase()
			.element()
			.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true }));
		await userEvent.hover(control());
		await new Promise((resolve) => setTimeout(resolve, 600));
		expect(oninput.values).toEqual([0]);
		window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerType: 'mouse' }));
	});
});

describe('in a remote form', () => {
	function input() {
		return page.getByTestId('input');
	}

	it('follows the string value of a number spread whenever the form changes it', async () => {
		const values = $state<Record<string, unknown>>({ seats: 4 });
		const fields = kitFields(values);
		render(RemoteControlHarness, {
			props: { fields, name: 'seats', control: 'number', spread: fields.seats.as('number') }
		});
		const hidden = hiddenNumber('n:seats/form');
		await expect.element(input()).toHaveValue('4');
		expect(hidden.value).toBe('4');

		await userEvent.click(page.getByTestId('increment'));
		await expect.element(input()).toHaveValue('5');
		expect(hidden.value).toBe('5');

		values.seats = 9;
		await expect.element(input()).toHaveValue('9');
		expect(hidden.value).toBe('9');
	});

	it('names a bare number field from its Field and starts at the value the form holds', async () => {
		render(RemoteControlHarness, {
			props: {
				fields: kitFields({ seats: 7 }),
				name: 'seats',
				control: 'number',
				props: { defaultValue: 3 }
			}
		});
		await expect.element(input()).toHaveValue('7');
		expect(hiddenNumber('n:seats/form').value).toBe('7');
		expect(document.querySelectorAll('input[name="n:seats/form"]')).toHaveLength(1);
	});

	it('fires input after the hidden input holds the value, for a form listener', async () => {
		const read: string[] = [];
		const listen = (event: Event) => {
			if (event.target instanceof HTMLInputElement && event.target.type === 'number')
				read.push(`${event.type}:${event.target.name}=${event.target.value}`);
		};
		document.addEventListener('input', listen);
		document.addEventListener('change', listen);
		onTestFinished(() => {
			document.removeEventListener('input', listen);
			document.removeEventListener('change', listen);
		});
		const fields = kitFields({ seats: 4 });
		render(RemoteControlHarness, {
			props: { fields, name: 'seats', control: 'number', spread: fields.seats.as('number') }
		});
		await userEvent.click(page.getByTestId('increment'));
		await expect.poll(() => read).toEqual(['input:n:seats/form=5', 'change:n:seats/form=5']);
	});
});
