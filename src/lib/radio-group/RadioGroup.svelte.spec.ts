// Assertions follow Base UI v1.8.0 packages/react/src/radio-group/RadioGroup.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Field, inputRef, and describeConformance are not ported.
// Cases under "native Svelte" have no upstream counterpart.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RadioGroupComponentHarness from '../../tests/RadioGroupComponentHarness.svelte';

function radio(name: string) {
	return page.getByRole('radio', { name, exact: true });
}

function group() {
	return page.getByRole('radiogroup');
}

function calls() {
	return JSON.parse(page.getByTestId('calls').element().textContent ?? '[]') as {
		value: string;
		reason: string;
		canceled: boolean;
		shiftKey: boolean;
	}[];
}

function hiddenInput(name: string) {
	const root = radio(name).element();
	const input = root.nextElementSibling;
	if (!(input instanceof HTMLInputElement)) throw new Error('expected a hidden radio');
	return input;
}

describe('RadioGroup', () => {
	describe('props', () => {
		it('forwards id and lets extra props override the role', async () => {
			render(RadioGroupComponentHarness, { scenario: 'override' });
			const root = page.getByTestId('root');
			await expect.element(root).toHaveAttribute('id', 'group-id');
			await expect.element(root).toHaveAttribute('role', 'group');
			await expect.element(root).not.toHaveAttribute('value');
		});

		it('selects defaultValue when value is omitted', async () => {
			render(RadioGroupComponentHarness, { scenario: 'default' });
			await expect.element(radio('B')).toHaveAttribute('aria-checked', 'true');
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'false');
		});

		it('selects the radio whose value was passed and gives it the tab stop', async () => {
			render(RadioGroupComponentHarness, { scenario: 'initial' });
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'false');
			await expect.element(radio('A')).toHaveAttribute('tabindex', '-1');
			await expect.element(radio('B')).toHaveAttribute('aria-checked', 'true');
			await expect.element(radio('B')).toHaveAttribute('tabindex', '0');
			await expect.element(radio('B')).toHaveAttribute('data-checked', '');
		});

		it('puts the group name on each hidden input', async () => {
			render(RadioGroupComponentHarness, { scenario: 'name' });
			await expect.element(radio('A')).toBeVisible();
			const input = hiddenInput('A');
			expect(input).toHaveAttribute('name', 'radio-group');
			expect(input).toHaveAttribute('value', 'a');
		});
	});

	describe('prop: onValueChange', () => {
		it('selects the clicked radio and reports the value', async () => {
			render(RadioGroupComponentHarness, { scenario: 'plain' });
			await radio('A').click();
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'true');
			await expect.element(radio('B')).toHaveAttribute('aria-checked', 'false');
			expect(calls()).toEqual([{ value: 'a', reason: 'none', canceled: false, shiftKey: false }]);

			await radio('B').click();
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'false');
			await expect.element(radio('B')).toHaveAttribute('aria-checked', 'true');
			expect(calls()[1]).toEqual({ value: 'b', reason: 'none', canceled: false, shiftKey: false });
		});

		it('reports shift from the activation click', async () => {
			render(RadioGroupComponentHarness, { scenario: 'plain' });
			await userEvent.keyboard('{Shift>}');
			await userEvent.click(radio('A').element());
			await userEvent.keyboard('{/Shift}');
			expect(calls()).toEqual([{ value: 'a', reason: 'none', canceled: false, shiftKey: true }]);
		});

		it('selects with Space on keyup and ignores Enter', async () => {
			render(RadioGroupComponentHarness, { scenario: 'plain' });
			radio('A').element().focus();
			await userEvent.keyboard('{Enter}');
			expect(calls()).toEqual([]);
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'false');

			await userEvent.keyboard('{Space>}');
			expect(calls()).toEqual([]);
			await userEvent.keyboard('{/Space}');
			expect(calls()).toEqual([{ value: 'a', reason: 'none', canceled: false, shiftKey: false }]);
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'true');
		});

		it('keeps the previous value when the change is canceled', async () => {
			render(RadioGroupComponentHarness, { scenario: 'cancel' });
			await radio('A').click();
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'false');
			expect(hiddenInput('A').checked).toBe(false);
			expect(calls()).toEqual([{ value: 'a', reason: 'none', canceled: true, shiftKey: false }]);
		});

		it('moves focus on an arrow key without selecting when the change is canceled', async () => {
			render(RadioGroupComponentHarness, { scenario: 'cancel' });
			radio('A').element().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(radio('B')).toHaveAttribute('aria-checked', 'false');
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'false');
			expect(document.activeElement).toBe(radio('B').element());
			expect(hiddenInput('B').checked).toBe(false);
		});
	});

	describe('prop: disabled', () => {
		it('sets aria-disabled and ignores clicks', async () => {
			render(RadioGroupComponentHarness, { scenario: 'disabled' });
			await expect.element(group()).toHaveAttribute('aria-disabled', 'true');
			await expect.element(group()).toHaveAttribute('data-disabled', '');
			await expect.element(radio('A')).toHaveAttribute('aria-disabled', 'true');
			await expect.element(radio('A')).toHaveAttribute('data-disabled', '');
			expect(hiddenInput('A').disabled).toBe(true);
			(radio('A').element() as HTMLElement).click();
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'false');
			expect(calls()).toEqual([]);
		});

		it('omits aria-disabled when the group is enabled', async () => {
			render(RadioGroupComponentHarness, { scenario: 'plain' });
			await expect.element(group()).not.toHaveAttribute('aria-disabled');
		});
	});

	describe('prop: readOnly', () => {
		it('sets aria-readonly and ignores clicks', async () => {
			render(RadioGroupComponentHarness, { scenario: 'readonly' });
			await expect.element(group()).toHaveAttribute('aria-readonly', 'true');
			await expect.element(group()).toHaveAttribute('data-readonly', '');
			await radio('A').click();
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'false');
			expect(calls()).toEqual([]);
		});

		it('omits aria-readonly when the group is editable', async () => {
			render(RadioGroupComponentHarness, { scenario: 'plain' });
			await expect.element(group()).not.toHaveAttribute('aria-readonly');
		});
	});

	it('selects when the hidden input is clicked', async () => {
		render(RadioGroupComponentHarness, { scenario: 'plain' });
		hiddenInput('A').click();
		await expect.element(radio('A')).toHaveAttribute('aria-checked', 'true');
	});

	it('places style hooks on the group, the radio, and the indicator', async () => {
		render(RadioGroupComponentHarness, { scenario: 'style' });
		const root = group();
		const item = page.getByTestId('item');
		const indicator = page.getByTestId('indicator');
		await expect.element(root).toHaveAttribute('data-disabled', '');
		await expect.element(root).toHaveAttribute('data-readonly', '');
		await expect.element(root).toHaveAttribute('data-required', '');
		await expect.element(item).toHaveAttribute('data-checked', '');
		await expect.element(item).toHaveAttribute('data-disabled', '');
		await expect.element(item).toHaveAttribute('data-readonly', '');
		await expect.element(item).toHaveAttribute('data-required', '');
		await expect.element(indicator).toHaveAttribute('data-checked', '');
		await expect.element(indicator).toHaveAttribute('data-disabled', '');
		await expect.element(indicator).toHaveAttribute('data-readonly', '');
		await expect.element(indicator).toHaveAttribute('data-required', '');
	});

	describe('keyboard', () => {
		it('selects the next radio with either axis and loops', async () => {
			render(RadioGroupComponentHarness, { scenario: 'keys' });
			const a = radio('A');
			const b = radio('B');
			const c = radio('C');
			a.element().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(b).toHaveAttribute('aria-checked', 'true');
			expect(document.activeElement).toBe(b.element());

			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(c.element());
			await expect.element(c).toHaveAttribute('aria-checked', 'true');

			await userEvent.keyboard('{ArrowDown}');
			expect(document.activeElement).toBe(a.element());

			await userEvent.keyboard('{ArrowUp}');
			expect(document.activeElement).toBe(c.element());

			await userEvent.keyboard('{ArrowLeft}');
			expect(document.activeElement).toBe(b.element());
		});

		it('still moves when Shift is held', async () => {
			render(RadioGroupComponentHarness, { scenario: 'keys' });
			radio('A').element().focus();
			await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
			expect(document.activeElement).toBe(radio('B').element());
		});

		it('does not move on Home or End', async () => {
			render(RadioGroupComponentHarness, { scenario: 'keys' });
			radio('A').element().focus();
			await userEvent.keyboard('{Home}');
			expect(document.activeElement).toBe(radio('A').element());
			await userEvent.keyboard('{End}');
			expect(document.activeElement).toBe(radio('A').element());
		});

		it('swaps horizontal arrows in RTL and keeps vertical arrows', async () => {
			render(RadioGroupComponentHarness, { scenario: 'keys', dir: 'rtl' });
			radio('A').element().focus();
			await userEvent.keyboard('{ArrowLeft}');
			expect(document.activeElement).toBe(radio('B').element());
			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(radio('A').element());
			await userEvent.keyboard('{ArrowDown}');
			expect(document.activeElement).toBe(radio('B').element());
		});

		it('skips a disabled radio', async () => {
			render(RadioGroupComponentHarness, { scenario: 'disabled-item' });
			await expect.element(radio('A')).toHaveAttribute('tabindex', '0');
			await expect.element(radio('B')).toHaveAttribute('tabindex', '-1');
			radio('A').element().focus();
			await userEvent.keyboard('{ArrowDown}');
			expect(document.activeElement).toBe(radio('C').element());
			await expect.element(radio('C')).toHaveAttribute('aria-checked', 'true');
			await userEvent.keyboard('{ArrowDown}');
			expect(document.activeElement).toBe(radio('A').element());
		});
	});

	describe('item removal', () => {
		it('moves the tab stop to the checked radio when the highlighted radio is removed', async () => {
			render(RadioGroupComponentHarness, { scenario: 'removal' });
			radio('B').element().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(page.getByTestId('c')).toHaveAttribute('tabindex', '0');
			await expect.element(radio('B')).toHaveAttribute('aria-checked', 'true');

			await page.getByRole('button', { name: 'Hide' }).click();
			await expect.element(page.getByTestId('a')).toHaveAttribute('tabindex', '-1');
			await expect.element(page.getByTestId('b')).toHaveAttribute('tabindex', '0');
		});
	});

	describe('labels', () => {
		it('selects from an implicit label and an explicit label', async () => {
			render(RadioGroupComponentHarness, { scenario: 'labels' });
			await page.getByTestId('label-a').click();
			await expect.element(radio('Apple')).toHaveAttribute('aria-checked', 'true');
			expect(calls()[0]?.value).toBe('a');

			await page.getByTestId('label-b').click();
			await expect.element(radio('Banana')).toHaveAttribute('aria-checked', 'true');
			expect(calls()[1]?.value).toBe('b');
		});
	});

	describe('Fieldset', () => {
		it('prefers an explicit label, then the legend', async () => {
			render(RadioGroupComponentHarness, { scenario: 'legend' });
			const legend = page.getByTestId('legend');
			await expect.element(group()).toHaveAttribute('aria-labelledby', 'explicit-label');
			await page.getByRole('button', { name: 'Remove explicit' }).click();
			await expect.element(group()).toHaveAttribute('aria-labelledby', legend.element().id);
		});
	});

	describe('Form', () => {
		it('submits the selected value to an external form', async () => {
			render(RadioGroupComponentHarness, { scenario: 'external' });
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
			await expect.element(page.getByTestId('external')).toHaveTextContent('b');
		});

		it('blocks submit until a required group has a selection', async () => {
			render(RadioGroupComponentHarness, { scenario: 'required' });
			await expect.element(group()).toHaveAttribute('aria-required', 'true');
			await expect.element(group()).toHaveAttribute('data-required', '');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('0');
			await radio('A').click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.element(page.getByTestId('submitted')).toHaveTextContent('1');
			await expect.element(page.getByTestId('external')).toHaveTextContent('a');
		});

		it('clears errors, revalidates, and marks dirty when the parent changes the value', async () => {
			render(RadioGroupComponentHarness, { scenario: 'parent' });
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{"color":"Pick one"}');
			await expect.element(page.getByTestId('field')).not.toHaveAttribute('data-dirty');
			await page.getByRole('button', { name: 'Set A' }).click();
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{}');
			await expect.element(page.getByTestId('field')).toHaveAttribute('data-dirty', '');
			await expect.element(page.getByTestId('error')).toHaveTextContent('nope');
		});

		it('clears a form error for the group name when the value changes', async () => {
			render(RadioGroupComponentHarness, { scenario: 'errors' });
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{"color":"Pick one"}');
			await radio('A').click();
			await expect.element(page.getByTestId('errors')).toHaveTextContent('{}');
		});
	});

	describe('native Svelte', () => {
		it('writes the first pick into an empty bind', async () => {
			render(RadioGroupComponentHarness, { scenario: 'pick' });
			await expect.element(page.getByTestId('picked')).toHaveTextContent('none');
			await radio('B').click();
			await expect.element(radio('B')).toHaveAttribute('aria-checked', 'true');
			await expect.element(page.getByTestId('picked')).toHaveTextContent('b');
			await expect.element(page.getByRole('checkbox', { name: 'Owner B' })).toBeChecked();
		});

		it('one-way value follows the parent, then the click, then the parent again', async () => {
			render(RadioGroupComponentHarness, { scenario: 'controlled' });
			await expect.element(radio('B')).toHaveAttribute('aria-checked', 'true');
			await radio('A').click();
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'true');
			await page.getByRole('button', { name: 'Clear' }).click();
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'false');
			await expect.element(radio('B')).toHaveAttribute('aria-checked', 'false');
			await page.getByRole('button', { name: 'Set B' }).click();
			await expect.element(radio('B')).toHaveAttribute('aria-checked', 'true');
		});

		it('selects an object value by reference', async () => {
			render(RadioGroupComponentHarness, { scenario: 'object' });
			await radio('B').click();
			await expect.element(radio('B')).toHaveAttribute('aria-checked', 'true');
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'false');
			expect(calls()[0]?.value).toBe('{"id":2}');
		});

		it('selects a null value', async () => {
			render(RadioGroupComponentHarness, { scenario: 'nullish' });
			await radio('A').click();
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'true');
			expect(calls()[0]?.value).toBe('null');
		});

		it('renders through a snippet with the checked tab stop', async () => {
			render(RadioGroupComponentHarness, { scenario: 'render' });
			const custom = page.getByTestId('custom');
			await expect.element(custom).toHaveAttribute('role', 'radiogroup');
			await expect.element(custom).toHaveAttribute('data-readonly-state', 'no');
			await expect.element(radio('B')).toHaveAttribute('tabindex', '0');
			await expect.element(radio('A')).toHaveAttribute('tabindex', '-1');
		});

		it('passes a consumer attachment to the host', async () => {
			render(RadioGroupComponentHarness, { scenario: 'attach' });
			await expect.element(page.getByTestId('attached')).toHaveTextContent('radiogroup');
		});

		it('preventDefault on keydown skips the arrow move', async () => {
			render(RadioGroupComponentHarness, { scenario: 'keys' });
			radio('A')
				.element()
				.addEventListener('keydown', (event) => {
					event.preventDefault();
				});
			radio('A').element().focus();
			await userEvent.keyboard('{ArrowDown}');
			expect(document.activeElement).toBe(radio('A').element());
			await expect.element(radio('A')).toHaveAttribute('aria-checked', 'false');
		});
	});
});
