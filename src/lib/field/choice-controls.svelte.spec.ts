// Assertions follow the Field cases of Base UI v1.8.0 packages/react/src/checkbox/root/CheckboxRoot.test.tsx,
// switch/root/SwitchRoot.test.tsx, radio-group/RadioGroup.test.tsx and checkbox-group/CheckboxGroup.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Sveltery: Checkbox, Switch and Radio boxes hold real `<input>` elements carrying the test id,
// Field state attributes sit on the box around them, and native events replace `onValueChange`.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChoiceFieldHarness from '../../tests/ChoiceFieldHarness.svelte';

function text(name: string) {
	return page.getByTestId(name).element().textContent ?? '';
}

/** The Checkbox, Switch or Radio input with this test id. */
function input(testId: string) {
	const element = page.getByTestId(testId).element();
	if (!(element instanceof HTMLInputElement)) throw new Error(`expected input ${testId}`);
	return element;
}

/** The painted box around the input with this test id. */
function box(testId: string) {
	const element = input(testId).parentElement;
	if (!element) throw new Error(`expected the box around ${testId}`);
	return element;
}

const submit = () => page.getByRole('button', { name: 'Submit' }).click();

describe('choice controls inside Field and Form', () => {
	for (const [scenario, name] of [
		['checkbox', 'tos'],
		['switch', 'alerts']
	] as const) {
		describe(scenario, () => {
			it('blocks the submit while required and unticked, then submits its value', async () => {
				render(ChoiceFieldHarness, { scenario });
				const control = page.getByTestId('control');

				await submit();
				expect(text('submitted')).toBe('0');
				expect(input('control').required).toBe(true);
				await expect.element(control).toHaveAttribute('aria-invalid', 'true');
				await expect.poll(() => box('control').hasAttribute('data-invalid')).toBe(true);
				await expect.element(page.getByTestId('field')).toHaveAttribute('data-invalid', '');
				await expect.element(control).toHaveFocus();

				await control.click();
				await expect.poll(() => input('control').checked).toBe(true);
				await expect.poll(() => box('control').hasAttribute('data-valid')).toBe(true);
				await submit();
				expect(text('submitted')).toBe('1');
				expect(text('values')).toBe(JSON.stringify({ [name]: 'on' }));
				expect(text('form-data')).toBe(JSON.stringify([[name, 'on']]));
			});

			it('is named by Field.Label and described by Field.Description', async () => {
				render(ChoiceFieldHarness, { scenario });
				const control = page.getByTestId('control');
				const label = page.getByTestId('label').element() as HTMLLabelElement;

				expect(label.htmlFor).toBe(input('control').id);
				expect(input('control').id).not.toBe('');
				await expect.element(control).toHaveAttribute('aria-labelledby', label.id);
				await expect
					.element(control)
					.toHaveAttribute(
						'aria-describedby',
						expect.stringContaining(page.getByTestId('description').element().id)
					);

				await expect.element(control).toHaveAccessibleName(label.textContent?.trim() ?? '');

				await page.getByTestId('label').click();
				await expect.poll(() => input('control').checked).toBe(true);
				expect(box('control').hasAttribute('data-dirty')).toBe(true);
				expect(box('control').hasAttribute('data-filled')).toBe(true);
			});
		});
	}

	describe('radio group', () => {
		it('blocks the submit while required and empty, then submits the selected value', async () => {
			render(ChoiceFieldHarness, { scenario: 'radio-group' });
			const group = page.getByTestId('control');

			await submit();
			expect(text('submitted')).toBe('0');
			await expect.element(group).toHaveAttribute('aria-invalid', 'true');
			await expect.element(group).toHaveAttribute('data-invalid', '');
			expect(box('free').hasAttribute('data-invalid')).toBe(true);
			await expect.element(page.getByTestId('free')).toHaveFocus();

			await page.getByTestId('pro').click();
			await submit();
			expect(text('submitted')).toBe('1');
			expect(text('values')).toBe(JSON.stringify({ plan: 'pro' }));
			expect(text('form-data')).toBe(JSON.stringify([['plan', 'pro']]));
		});

		it('is named by Field.Label without pointing the label at one radio', async () => {
			render(ChoiceFieldHarness, { scenario: 'radio-group' });
			const label = page.getByTestId('label').element() as HTMLLabelElement;

			expect(label.hasAttribute('for')).toBe(false);
			await expect
				.element(page.getByTestId('control'))
				.toHaveAttribute('aria-labelledby', label.id);
			expect(input('free').id).not.toBe(input('pro').id);
		});

		it('lets a Field.Item label point at its own radio', async () => {
			render(ChoiceFieldHarness, { scenario: 'radio-item' });
			const label = page.getByTestId('label').element() as HTMLLabelElement;

			expect(label.htmlFor).toBe(input('free').id);
			await expect.element(page.getByTestId('free')).toHaveAccessibleName('Free');
			await page.getByTestId('label').click();
			await expect.element(page.getByTestId('free')).toBeChecked();
		});
	});

	describe('checkbox group', () => {
		it('validates as one field and submits the ticked values', async () => {
			render(ChoiceFieldHarness, { scenario: 'checkbox-group' });
			const group = page.getByTestId('control');

			await submit();
			expect(text('submitted')).toBe('0');
			await expect.element(page.getByTestId('error')).toHaveTextContent('Pick one');
			await expect.element(group).toHaveAttribute('data-invalid', '');
			await expect.element(page.getByTestId('svelte')).toHaveFocus();

			await page.getByTestId('kit').click();
			await expect.element(group).toHaveAttribute('data-dirty', '');
			await expect.element(group).toHaveAttribute('data-filled', '');
			expect(input('kit').checked).toBe(true);
			expect([input('svelte').name, input('kit').name]).toEqual(['tags', 'tags']);
			await submit();
			expect(text('submitted')).toBe('1');
			expect(text('values')).toBe(JSON.stringify({ tags: 'kit' }));
			expect(text('form-data')).toBe(JSON.stringify([['tags', 'kit']]));
		});

		it('is named by Field.Label without pointing the label at one checkbox', async () => {
			render(ChoiceFieldHarness, { scenario: 'checkbox-group' });
			const label = page.getByTestId('label').element() as HTMLLabelElement;

			expect(label.hasAttribute('for')).toBe(false);
			await expect
				.element(page.getByTestId('control'))
				.toHaveAttribute('aria-labelledby', label.id);
			expect(input('svelte').id).not.toBe(input('kit').id);
			expect(input('svelte').id).not.toBe('');
		});
	});

	describe('handbook patterns', () => {
		it('names a Checkbox, a Switch and each Radio from a wrapping Field.Label', async () => {
			render(ChoiceFieldHarness, { scenario: 'wrapping-labels' });

			await expect.element(page.getByTestId('checkbox')).toHaveAccessibleName('Accept terms');
			await expect.element(page.getByTestId('switch')).toHaveAccessibleName('Restart on failure');
			await expect.element(page.getByTestId('ssd')).toHaveAccessibleName('SSD');
			await expect.element(page.getByTestId('hdd')).toHaveAccessibleName('HDD');

			await page.getByText('HDD').click();
			await expect.element(page.getByTestId('hdd')).toBeChecked();
		});

		it('describes each checkbox by the Field.Description in its Field.Item', async () => {
			render(ChoiceFieldHarness, { scenario: 'fieldset-items' });

			await expect
				.element(page.getByTestId('daily'))
				.toHaveAttribute(
					'aria-describedby',
					expect.stringContaining(page.getByTestId('daily-description').element().id)
				);
			await expect
				.element(page.getByTestId('monthly'))
				.toHaveAttribute(
					'aria-describedby',
					expect.stringContaining(page.getByTestId('monthly-description').element().id)
				);
			await expect.element(page.getByTestId('daily')).toHaveAccessibleDescription('Daily at 00:00');
			await expect.element(page.getByTestId('daily')).toHaveAccessibleName('daily');
		});

		it('names the Fieldset around a CheckboxGroup from its legend, as upstream does', async () => {
			render(ChoiceFieldHarness, { scenario: 'fieldset-items' });

			await expect.element(page.getByTestId('fieldset')).toHaveAccessibleName('Backup schedule');
			await expect.element(page.getByTestId('control')).not.toHaveAttribute('aria-labelledby');
		});

		it("names a CheckboxGroup's fieldset from a Fieldset.Legend inside it", async () => {
			render(ChoiceFieldHarness, { scenario: 'group-legend' });

			const group = page.getByRole('group', { name: 'Allowed network protocols' });
			await expect.element(group).toBeInTheDocument();
			expect(group.element()).toBe(page.getByTestId('control').element());
			expect(group.element().tagName).toBe('FIELDSET');
		});
	});
});
