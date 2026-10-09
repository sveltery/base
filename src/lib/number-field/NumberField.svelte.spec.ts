// Assertions follow Base UI v1.8.0 packages/react/src/number-field/**/*.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// describeConformance, ref, inputRef, and className callbacks are not ported.
import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import NumberFieldHarness from '../../tests/NumberFieldHarness.svelte';

function control() {
	return page.getByTestId('control');
}

function increase() {
	return page.getByRole('button', { name: 'Increase' });
}

function decrease() {
	return page.getByRole('button', { name: 'Decrease' });
}

function hiddenNumber(name = 'qty') {
	const input = document.querySelector(`input[type="number"][name="${name}"]`);
	if (!(input instanceof HTMLInputElement)) throw new Error('expected a hidden number input');
	return input;
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
		const hidden = hiddenNumber();
		hidden.value = '9';
		hidden.dispatchEvent(new Event('input', { bubbles: true }));
		hidden.dispatchEvent(new Event('change', { bubbles: true }));
		await expect.poll(() => page.getByTestId('calls').element().textContent).toBe('1');
	});

	it('updates the value and validates when autofill fires only a change event', async () => {
		render(NumberFieldHarness, { scenario: 'autofill' });
		const hidden = hiddenNumber();
		hidden.value = '9';
		hidden.dispatchEvent(new Event('change', { bubbles: true }));
		await expect.poll(() => control().element().value).toBe('9');
		await expect.poll(() => page.getByTestId('calls').element().textContent).toBe('1');
	});

	it('validates when autofill repeats the current value', async () => {
		render(NumberFieldHarness, { scenario: 'autofill' });
		const hidden = hiddenNumber();
		expect(hidden.value).toBe('4');
		hidden.dispatchEvent(new Event('change', { bubbles: true }));
		await expect.poll(() => page.getByTestId('calls').element().textContent).toBe('1');
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

	it('steps up and down from a click', async () => {
		const onValueChange = vi.fn();
		const onValueCommitted = vi.fn();
		render(NumberFieldHarness, { scenario: 'plain', onValueChange, onValueCommitted });

		await userEvent.click(increase().element());
		await expect.element(control()).toHaveValue('5');
		expect(onValueChange).toHaveBeenCalled();
		expect(onValueChange.mock.lastCall?.[0]).toBe(5);
		expect(onValueChange.mock.lastCall?.[1].reason).toBe('increment-press');
		expect(onValueCommitted.mock.lastCall?.[0]).toBe(5);

		await userEvent.click(decrease().element());
		await expect.element(control()).toHaveValue('4');
		expect(onValueCommitted.mock.lastCall?.[1].reason).toBe('decrement-press');
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
		const onValueCommitted = vi.fn();
		render(NumberFieldHarness, { scenario: 'plain', onValueCommitted });
		const input = control().element() as HTMLInputElement;
		input.focus();
		await userEvent.fill(input, '12');
		input.blur();
		await expect.element(control()).toHaveValue('12');
		expect(onValueCommitted.mock.lastCall?.[0]).toBe(12);
		expect(onValueCommitted.mock.lastCall?.[1].reason).toBe('input-blur');
	});

	it('does not commit a canceled keyboard change', async () => {
		const onValueChange = vi.fn((_value: number | null, details: { cancel: () => void }) => {
			details.cancel();
		});
		const onValueCommitted = vi.fn();
		render(NumberFieldHarness, { scenario: 'plain', onValueChange, onValueCommitted });
		(control().element() as HTMLElement).focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect.element(control()).toHaveValue('4');
		expect(onValueCommitted).not.toHaveBeenCalled();
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
		const onValueChange = vi.fn();
		render(NumberFieldHarness, { scenario: 'increment-disabled', onValueChange });
		await expect.element(increase()).toHaveAttribute('disabled');
		increase()
			.element()
			.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' })
			);
		expect(onValueChange).not.toHaveBeenCalled();
		await expect.element(control()).toHaveValue('0');
	});

	it('marks read-only steppers with aria-disabled and no aria-readonly', async () => {
		render(NumberFieldHarness, { scenario: 'readonly' });
		await expect.element(control()).toHaveAttribute('readonly');
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
		const onValueChange = vi.fn();
		render(NumberFieldHarness, { scenario: 'out-of-range', onValueChange });
		const input = control().element() as HTMLInputElement;
		input.focus();
		await userEvent.fill(input, '9');
		expect(onValueChange.mock.lastCall?.[0]).toBe(9);
		await expect.element(control()).toHaveValue('9');
		await expect.element(increase()).toHaveAttribute('disabled');
		await userEvent.click(decrease().element());
		await expect.element(control()).toHaveValue('5');
	});

	it('pastes a number over the selection', async () => {
		const onValueChange = vi.fn();
		render(NumberFieldHarness, { scenario: 'paste', onValueChange });
		const input = control().element() as HTMLInputElement;
		input.focus();
		input.select();
		const data = new DataTransfer();
		data.setData('text/plain', '20');
		input.dispatchEvent(
			new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data })
		);
		expect(onValueChange.mock.lastCall?.[0]).toBe(20);
		expect(onValueChange.mock.lastCall?.[1].reason).toBe('input-paste');
		await expect.element(control()).toHaveValue('20');
	});

	it('changes the focused value from the wheel and commits it', async () => {
		const onValueChange = vi.fn();
		const onValueCommitted = vi.fn();
		render(NumberFieldHarness, {
			scenario: 'wheel',
			onValueChange,
			onValueCommitted
		});
		const input = control().element() as HTMLInputElement;
		input.focus();
		input.dispatchEvent(new WheelEvent('wheel', { deltaY: -1, cancelable: true, bubbles: true }));
		await expect.element(control()).toHaveValue('11');
		expect(onValueChange.mock.lastCall?.[0]).toBe(11);
		expect(onValueChange.mock.lastCall?.[1].reason).toBe('wheel');
		expect(onValueCommitted.mock.lastCall?.[0]).toBe(11);
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
			const onValueChange = vi.fn();
			render(NumberFieldHarness, { scenario: 'scrub', onValueChange });
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
			expect(onValueChange.mock.lastCall?.[1].reason).toBe('scrub');
			window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
			await expect.element(page.getByTestId('root')).not.toHaveAttribute('data-scrubbing');
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
