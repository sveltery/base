// Assertions follow Base UI v1.8.0 packages/react/src/radio-group/RadioGroup.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Cases from upstream commit e6d1d4050 follow v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// Sveltery: the group is a `<fieldset>` and each radio a real `<input type="radio">` over a
// painted box, so `checked` and `disabled` are the input's own, and native events replace
// `onValueChange` (docs/upstream-differences.md).
// Field cases are in src/lib/field/choice-controls.svelte.spec.ts. inputRef and
// describeConformance are not ported.
// Cases under "native Svelte" have no upstream counterpart.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import RadioGroupComponentHarness from '../../tests/RadioGroupComponentHarness.svelte';
import RadioIgnoredArrowHarness from '../../tests/RadioIgnoredArrowHarness.svelte';

function radio(name: string) {
	return page.getByRole('radio', { name, exact: true });
}

function input(name: string) {
	const element = radio(name).element();
	if (!(element instanceof HTMLInputElement)) throw new Error('expected a radio input');
	return element;
}

/** The painted box around a radio's input, which carries the state attributes. */
function box(name: string) {
	const element = input(name).parentElement;
	if (!element) throw new Error('expected the radio box');
	return element;
}

function group() {
	return page.getByRole('radiogroup');
}

/** The `value` of each input whose `change` event reached the group. */
function changes() {
	return JSON.parse(page.getByTestId('changes').element().textContent ?? '[]') as string[];
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

		it('renders a fieldset with the radiogroup role', async () => {
			render(RadioGroupComponentHarness, { scenario: 'plain' });
			expect(group().element().tagName).toBe('FIELDSET');
			await expect.element(group()).toHaveAccessibleName('Colors');
		});

		it('selects defaultValue when value is omitted', async () => {
			render(RadioGroupComponentHarness, { scenario: 'default' });
			await expect.element(radio('B')).toBeChecked();
			await expect.element(radio('A')).not.toBeChecked();
		});

		it('selects the radio whose value was passed and gives it the tab stop', async () => {
			render(RadioGroupComponentHarness, { scenario: 'initial' });
			await expect.element(radio('A')).not.toBeChecked();
			await expect.element(radio('A')).toHaveAttribute('tabindex', '-1');
			await expect.element(radio('B')).toBeChecked();
			await expect.element(radio('B')).toHaveAttribute('tabindex', '0');
			expect(box('B').hasAttribute('data-checked')).toBe(true);
		});

		it('puts the group name and each value on the inputs', async () => {
			render(RadioGroupComponentHarness, { scenario: 'name' });
			await expect.element(radio('A')).toHaveAttribute('name', 'radio-group');
			await expect.element(radio('A')).toHaveAttribute('value', 'a');
		});

		it('names an unnamed group, so the browser keeps one radio checked', async () => {
			render(RadioGroupComponentHarness, { scenario: 'plain' });
			const name = input('A').name;
			expect(name).not.toBe('');
			expect(input('B').name).toBe(name);
		});
	});

	describe('native events', () => {
		it('selects the clicked radio and fires change through the group', async () => {
			render(RadioGroupComponentHarness, { scenario: 'plain' });
			await radio('A').click();
			await expect.element(radio('A')).toBeChecked();
			await expect.element(radio('B')).not.toBeChecked();
			expect(changes()).toEqual(['a']);

			await radio('B').click();
			await expect.element(radio('A')).not.toBeChecked();
			await expect.element(radio('B')).toBeChecked();
			expect(changes()).toEqual(['a', 'b']);
		});

		it('selects with Space on keyup and ignores Enter', async () => {
			render(RadioGroupComponentHarness, { scenario: 'plain' });
			input('A').focus();
			await userEvent.keyboard('{Enter}');
			expect(changes()).toEqual([]);
			await expect.element(radio('A')).not.toBeChecked();

			await userEvent.keyboard('{Space>}');
			expect(changes()).toEqual([]);
			await userEvent.keyboard('{/Space}');
			expect(changes()).toEqual(['a']);
			await expect.element(radio('A')).toBeChecked();
		});

		it('keeps the previous value when onclick calls preventDefault', async () => {
			render(RadioGroupComponentHarness, { scenario: 'cancel' });
			await radio('A').click();
			await expect.element(radio('A')).not.toBeChecked();
			expect(changes()).toEqual([]);
		});

		it('keeps the selected named radio checked when a click on another is prevented', async () => {
			render(RadioGroupComponentHarness, { scenario: 'cancel-selected' });
			await expect.element(radio('B')).toBeChecked();
			await radio('A').click();
			expect(changes()).toEqual([]);
			await expect.element(radio('B')).toBeChecked();
			await expect.element(radio('A')).not.toBeChecked();
		});

		it('keeps submitting the selected value when a read-only radio is clicked through its label', async () => {
			render(RadioGroupComponentHarness, { scenario: 'readonly-label' });
			await page.getByText('Label A').click();
			const form = page.getByTestId('form').element() as HTMLFormElement;
			expect(new FormData(form).getAll('color')).toEqual(['b']);
		});

		it('moves focus on an arrow key without selecting when the click is prevented', async () => {
			render(RadioGroupComponentHarness, { scenario: 'cancel' });
			input('A').focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(radio('B')).not.toBeChecked();
			await expect.element(radio('A')).not.toBeChecked();
			expect(document.activeElement).toBe(input('B'));
		});
	});

	describe('prop: disabled', () => {
		it('disables the fieldset natively and ignores clicks', async () => {
			render(RadioGroupComponentHarness, { scenario: 'disabled' });
			expect((group().element() as HTMLFieldSetElement).disabled).toBe(true);
			await expect.element(group()).toHaveAttribute('data-disabled', '');
			await expect.element(radio('A')).toBeDisabled();
			expect(box('A').hasAttribute('data-disabled')).toBe(true);
			input('A').click();
			await expect.element(radio('A')).not.toBeChecked();
			expect(changes()).toEqual([]);
		});

		it('keeps the first radio as the tab stop when every radio is disabled', async () => {
			render(RadioGroupComponentHarness, { scenario: 'disabled' });
			await expect.element(radio('A')).toHaveAttribute('tabindex', '0');
			await expect.element(radio('B')).toHaveAttribute('tabindex', '-1');
		});

		it('keeps the checked radio as the tab stop when every radio is disabled', async () => {
			render(RadioGroupComponentHarness, { scenario: 'disabled-checked' });
			await expect.element(radio('B')).toHaveAttribute('tabindex', '0');
			await expect.element(radio('A')).toHaveAttribute('tabindex', '-1');
		});

		it('leaves the fieldset enabled when the group is enabled', async () => {
			render(RadioGroupComponentHarness, { scenario: 'plain' });
			expect((group().element() as HTMLFieldSetElement).disabled).toBe(false);
		});
	});

	describe('prop: readOnly', () => {
		it('sets aria-readonly and ignores clicks', async () => {
			render(RadioGroupComponentHarness, { scenario: 'readonly' });
			await expect.element(group()).toHaveAttribute('aria-readonly', 'true');
			await expect.element(group()).toHaveAttribute('data-readonly', '');
			await radio('A').click();
			await expect.element(radio('A')).not.toBeChecked();
			expect(changes()).toEqual([]);
		});

		it('omits aria-readonly when the group is editable', async () => {
			render(RadioGroupComponentHarness, { scenario: 'plain' });
			await expect.element(group()).not.toHaveAttribute('aria-readonly');
		});
	});

	it('places style hooks on the group, the radio box, and the indicator', async () => {
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
			await expect.element(b).toBeChecked();
			expect(document.activeElement).toBe(b.element());

			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(c.element());
			await expect.element(c).toBeChecked();

			await userEvent.keyboard('{ArrowDown}');
			expect(document.activeElement).toBe(a.element());

			await userEvent.keyboard('{ArrowUp}');
			expect(document.activeElement).toBe(c.element());

			await userEvent.keyboard('{ArrowLeft}');
			expect(document.activeElement).toBe(b.element());
		});

		it.each(['Meta', 'Control', 'Alt', 'single'])(
			'does not select on refocus after an ignored arrow (%s)',
			async (scenario) => {
				const onchange = vi.fn();
				render(RadioIgnoredArrowHarness, { disableSecond: scenario === 'single', onchange });
				const a = page.getByRole('radio', { name: 'A' });
				(a.element() as HTMLElement).focus();

				await userEvent.keyboard(
					scenario === 'single' ? '{ArrowDown}' : `{${scenario}>}{ArrowDown}{/${scenario}}`
				);
				expect(document.activeElement).toBe(a.element());
				await expect.element(a).not.toBeChecked();

				await userEvent.tab();
				expect(document.activeElement).toBe(
					page.getByRole('button', { name: 'Outside' }).element()
				);

				await userEvent.tab({ shift: true });
				expect(document.activeElement).toBe(a.element());
				await expect.element(a).not.toBeChecked();
				expect(onchange).not.toHaveBeenCalled();
			}
		);

		it('still moves and selects when Shift is held', async () => {
			render(RadioGroupComponentHarness, { scenario: 'keys' });
			input('A').focus();
			await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
			expect(document.activeElement).toBe(radio('B').element());
			await expect.element(radio('B')).toBeChecked();
			await expect.element(radio('A')).not.toBeChecked();
		});

		it('does not move on Home or End', async () => {
			render(RadioGroupComponentHarness, { scenario: 'keys' });
			input('A').focus();
			await userEvent.keyboard('{Home}');
			expect(document.activeElement).toBe(radio('A').element());
			await userEvent.keyboard('{End}');
			expect(document.activeElement).toBe(radio('A').element());
		});

		it('swaps horizontal arrows in RTL and keeps vertical arrows', async () => {
			render(RadioGroupComponentHarness, { scenario: 'keys', dir: 'rtl' });
			input('A').focus();
			await userEvent.keyboard('{ArrowLeft}');
			expect(document.activeElement).toBe(radio('B').element());
			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(radio('A').element());
			await userEvent.keyboard('{ArrowDown}');
			expect(document.activeElement).toBe(radio('B').element());
		});

		// Sveltery: a natively disabled input cannot hold focus, so the arrow starts from B.
		it('moves the tab stop off a radio disabled after mount and skips it', async () => {
			render(RadioGroupComponentHarness, { scenario: 'late-disable' });
			const a = radio('A');
			const b = radio('B');
			await expect.element(a).toHaveAttribute('tabindex', '0');
			await page.getByRole('button', { name: 'Disable A' }).click();
			await expect.element(a).toHaveAttribute('tabindex', '-1');
			await expect.element(b).toHaveAttribute('tabindex', '0');
			input('B').focus();
			await userEvent.keyboard('{ArrowLeft}');
			expect(document.activeElement).toBe(input('C'));
		});

		it('skips a disabled radio', async () => {
			render(RadioGroupComponentHarness, { scenario: 'disabled-item' });
			await expect.element(radio('A')).toHaveAttribute('tabindex', '0');
			await expect.element(radio('B')).toHaveAttribute('tabindex', '-1');
			input('A').focus();
			await userEvent.keyboard('{ArrowDown}');
			expect(document.activeElement).toBe(radio('C').element());
			await expect.element(radio('C')).toBeChecked();
			await userEvent.keyboard('{ArrowDown}');
			expect(document.activeElement).toBe(radio('A').element());
		});
	});

	describe('item removal', () => {
		it('moves the tab stop to the checked radio when the highlighted radio is removed', async () => {
			render(RadioGroupComponentHarness, { scenario: 'removal' });
			input('B').focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.element(page.getByTestId('c')).toHaveAttribute('tabindex', '0');
			await expect.element(radio('B')).toBeChecked();

			await page.getByRole('button', { name: 'Hide' }).click();
			await expect.element(page.getByTestId('a')).toHaveAttribute('tabindex', '-1');
			await expect.element(page.getByTestId('b')).toHaveAttribute('tabindex', '0');
		});
	});

	describe('labels', () => {
		it('selects from an implicit label and an explicit label', async () => {
			render(RadioGroupComponentHarness, { scenario: 'labels' });
			await page.getByTestId('label-a').click();
			await expect.element(radio('Apple')).toBeChecked();
			expect(changes()).toEqual(['a']);

			await page.getByTestId('label-b').click();
			await expect.element(radio('Banana')).toBeChecked();
			expect(changes()).toEqual(['a', 'b']);
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
			await expect.element(radio('B')).toBeChecked();
			await expect.element(page.getByTestId('picked')).toHaveTextContent('b');
			await expect.element(page.getByRole('checkbox', { name: 'Owner B' })).toBeChecked();
		});

		it('one-way value follows the parent, then the click, then the parent again', async () => {
			render(RadioGroupComponentHarness, { scenario: 'controlled' });
			await expect.element(radio('B')).toBeChecked();
			await radio('A').click();
			await expect.element(radio('A')).toBeChecked();
			await page.getByRole('button', { name: 'Clear' }).click();
			await expect.element(radio('A')).not.toBeChecked();
			await expect.element(radio('B')).not.toBeChecked();
			await page.getByRole('button', { name: 'Set B' }).click();
			await expect.element(radio('B')).toBeChecked();
		});

		it('selects an object value by reference', async () => {
			render(RadioGroupComponentHarness, { scenario: 'object' });
			await radio('B').click();
			await expect.element(radio('B')).toBeChecked();
			await expect.element(radio('A')).not.toBeChecked();
			expect(changes()).toEqual(['{"id":2}']);
		});

		it('selects a null value', async () => {
			render(RadioGroupComponentHarness, { scenario: 'nullish' });
			await radio('A').click();
			await expect.element(radio('A')).toBeChecked();
			// The input submits a null value as the empty string.
			expect(changes()).toEqual(['']);
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
			await expect.element(page.getByTestId('attached')).toHaveTextContent('fieldset');
		});

		it('preventDefault on keydown skips the arrow move', async () => {
			render(RadioGroupComponentHarness, { scenario: 'keys' });
			radio('A')
				.element()
				.addEventListener('keydown', (event) => {
					event.preventDefault();
				});
			input('A').focus();
			await userEvent.keyboard('{ArrowDown}');
			expect(document.activeElement).toBe(radio('A').element());
			await expect.element(radio('A')).not.toBeChecked();
		});
	});
});
