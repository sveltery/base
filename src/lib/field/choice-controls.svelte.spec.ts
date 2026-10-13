// Assertions follow the Field cases of Base UI v1.8.0 packages/react/src/checkbox/root/CheckboxRoot.test.tsx,
// switch/root/SwitchRoot.test.tsx, radio-group/RadioGroup.test.tsx and checkbox-group/CheckboxGroup.test.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChoiceFieldHarness from '../../tests/ChoiceFieldHarness.svelte';

function text(name: string) {
	return page.getByTestId(name).element().textContent ?? '';
}

function hiddenInput(testId: string) {
	const input = page.getByTestId(testId).element().nextElementSibling;
	if (!(input instanceof HTMLInputElement)) throw new Error('expected a hidden input');
	return input;
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
				await expect.element(control).toHaveAttribute('aria-invalid', 'true');
				await expect.element(control).toHaveAttribute('data-invalid', '');
				await expect.element(page.getByTestId('field')).toHaveAttribute('data-invalid', '');
				await expect.element(control).toHaveFocus();

				await control.click();
				await expect.element(control).toHaveAttribute('data-valid', '');
				await submit();
				expect(text('submitted')).toBe('1');
				expect(text('values')).toBe(JSON.stringify({ [name]: true }));
				expect(text('form-data')).toBe(JSON.stringify([[name, 'on']]));
			});

			it('is named by Field.Label and described by Field.Description', async () => {
				render(ChoiceFieldHarness, { scenario });
				const control = page.getByTestId('control');
				const label = page.getByTestId('label').element() as HTMLLabelElement;
				const input = hiddenInput('control');

				expect(label.htmlFor).toBe(input.id);
				expect(input.id).not.toBe('');
				await expect.element(control).toHaveAttribute('aria-labelledby', label.id);
				await expect
					.element(control)
					.toHaveAttribute('aria-describedby', page.getByTestId('description').element().id);

				await page.getByTestId('label').click();
				await expect.element(control).toHaveAttribute('aria-checked', 'true');
				await expect.element(control).toHaveAttribute('data-dirty', '');
				await expect.element(control).toHaveAttribute('data-filled', '');
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
			await expect.element(page.getByTestId('free')).toHaveAttribute('data-invalid', '');
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
			expect(hiddenInput('free').id).not.toBe(hiddenInput('pro').id);
		});

		it('lets a Field.Item label point at its own radio', async () => {
			render(ChoiceFieldHarness, { scenario: 'radio-item' });
			const label = page.getByTestId('label').element() as HTMLLabelElement;

			expect(label.htmlFor).toBe(hiddenInput('free').id);
			await expect.element(page.getByTestId('free')).toHaveAttribute('aria-labelledby', label.id);
			await page.getByTestId('label').click();
			await expect.element(page.getByTestId('free')).toHaveAttribute('aria-checked', 'true');
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
			await submit();
			expect(text('submitted')).toBe('1');
			expect(text('values')).toBe(JSON.stringify({ tags: ['kit'] }));
			expect(text('form-data')).toBe(JSON.stringify([['tags', 'kit']]));
		});

		it('is named by Field.Label without pointing the label at one checkbox', async () => {
			render(ChoiceFieldHarness, { scenario: 'checkbox-group' });
			const label = page.getByTestId('label').element() as HTMLLabelElement;

			expect(label.hasAttribute('for')).toBe(false);
			await expect
				.element(page.getByTestId('control'))
				.toHaveAttribute('aria-labelledby', label.id);
			expect(hiddenInput('svelte').id).not.toBe(hiddenInput('kit').id);
		});
	});
});
