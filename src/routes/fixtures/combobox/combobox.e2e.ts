// Each case runs against the Svelte Combobox and the React Base UI 1.9.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'combobox', scenario, reference);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('filters as you type and selects an option', async ({ page }) => {
			const { errors } = await open(page, 'plain', reference);
			const input = page.getByTestId('input');
			await expect(input).toHaveAttribute('aria-expanded', 'false');

			await input.click();
			await expect(page.getByRole('listbox')).toBeVisible();
			await expect(page.getByRole('option')).toHaveCount(3);

			await input.pressSequentially('an');
			await expect(page.getByRole('option')).toHaveText(['Banana']);

			await page.getByRole('option', { name: 'Banana' }).click();
			await expect(input).toHaveValue('Banana');
			await expect(input).toHaveAttribute('aria-expanded', 'false');
			await expect(page.getByRole('listbox')).toBeHidden();
			await expect(input).toBeFocused();
			expect(errors).toEqual([]);
		});

		test('navigates with the keyboard and keeps focus on the input', async ({ page }) => {
			await open(page, 'plain', reference);
			const input = page.getByTestId('input');
			await input.focus();

			await page.keyboard.press('ArrowDown');
			await expect(page.getByRole('listbox')).toBeVisible();
			const apple = page.getByRole('option', { name: 'Apple' });
			await expect(apple).toHaveAttribute('data-highlighted', '');
			await expect(input).toHaveAttribute(
				'aria-activedescendant',
				(await apple.getAttribute('id'))!
			);
			await expect(input).toBeFocused();

			await page.keyboard.press('ArrowDown');
			await expect(page.getByRole('option', { name: 'Banana' })).toHaveAttribute(
				'data-highlighted',
				''
			);
			await page.keyboard.press('Enter');

			await expect(input).toHaveValue('Banana');
			await expect(page.getByRole('listbox')).toBeHidden();
			await expect(input).toBeFocused();
		});

		test('shows the empty state when nothing matches', async ({ page }) => {
			await open(page, 'plain', reference);
			await page.getByTestId('input').click();
			await page.getByTestId('input').pressSequentially('zz');

			await expect(page.getByRole('option')).toHaveCount(0);
			await expect(page.getByTestId('empty')).toHaveText('No fruits found');
		});

		test('clears the selection with the clear button', async ({ page }) => {
			await open(page, 'plain', reference);
			await page.getByTestId('trigger').click();
			await page.getByRole('option', { name: 'Cherry' }).click();
			await expect(page.getByTestId('input')).toHaveValue('Cherry');

			await page.getByTestId('clear').click();
			await expect(page.getByTestId('input')).toHaveValue('');
			await expect(page.getByTestId('clear')).toHaveCount(0);
			await expect(page.getByTestId('input')).toBeFocused();
		});

		test('adds chips in multiple mode and removes them from the keyboard', async ({ page }) => {
			await open(page, 'multiple', reference);
			const input = page.getByTestId('input');
			await input.click();
			await page.getByRole('option', { name: 'Apple' }).click();
			await page.getByRole('option', { name: 'Cherry' }).click();

			await expect(page.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
			await expect(page.getByTestId('chip-Apple')).toBeVisible();
			await expect(page.getByTestId('chip-Cherry')).toBeVisible();
			await expect(input).toBeFocused();

			await page.keyboard.press('Escape');
			await page.keyboard.press('Backspace');
			await expect(page.getByTestId('chip-Cherry')).toHaveCount(0);
			await expect(page.getByTestId('chip-Apple')).toBeVisible();

			await page.getByRole('button', { name: 'Remove Apple' }).click();
			await expect(page.getByTestId('chips')).not.toHaveAttribute('role', 'toolbar');
			await expect(input).toBeFocused();
		});

		test('moves focus into a popup input and shows the value on the trigger', async ({ page }) => {
			await open(page, 'popup-input', reference);
			const trigger = page.getByTestId('trigger');
			await expect(trigger).toHaveText('Pick a fruit');

			await trigger.click();
			await expect(page.getByRole('dialog')).toBeVisible();
			await expect(page.getByTestId('input')).toBeFocused();

			await page.keyboard.type('che');
			await expect(page.getByRole('option')).toHaveText(['Cherry']);
			await page.keyboard.press('ArrowDown');
			await page.keyboard.press('Enter');

			await expect(trigger).toHaveText('Cherry');
			await expect(page.getByRole('dialog')).toBeHidden();
			await expect(trigger).toBeFocused();
		});

		test('blocks an empty required submit, then submits the value', async ({ page }) => {
			await open(page, 'form', reference);
			await expect(page.getByRole('combobox', { name: 'Fruit' })).toBeVisible();
			await expect(page.getByTestId('error')).toHaveCount(0);

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByText('Required')).toBeVisible();
			await expect(page.getByTestId('submitted')).toHaveText('0');
			await expect(page.getByTestId('field')).toHaveAttribute('data-invalid', '');

			await page.getByTestId('input').click();
			await page.getByRole('option', { name: 'Banana' }).click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByTestId('submitted')).toHaveText('1');
			await expect(page.getByTestId('values')).toHaveText(JSON.stringify({ fruit: 'Banana' }));
		});

		test('restores the default value on a native form reset', async ({ page }) => {
			await open(page, 'reset', reference);
			const hidden = page.locator('input[name="fruit"]');
			await expect(hidden).toHaveValue('Apple');

			await page.getByTestId('trigger').click();
			await page.getByRole('option', { name: 'Cherry' }).click();
			await expect(page.getByTestId('input')).toHaveValue('Cherry');
			await expect(hidden).toHaveValue('Cherry');

			await page.getByRole('button', { name: 'Reset' }).click();
			// React Base UI keeps its state on a native reset. See "Form reset" in
			// docs/upstream-differences.md.
			await expect(page.getByTestId('input')).toHaveValue(reference ? 'Cherry' : 'Apple');
			if (!reference) await expect(hidden).toHaveValue('Apple');
		});

		test('does not open when disabled', async ({ page }) => {
			await open(page, 'disabled', reference);
			const input = page.getByTestId('input');
			await expect(input).toBeDisabled();
			await page.getByTestId('trigger').click({ force: true });
			await expect(page.getByRole('listbox')).toHaveCount(0);
			await expect(input).toHaveValue('Apple');
		});

		test('keeps the value when read-only', async ({ page }) => {
			await open(page, 'readonly', reference);
			const input = page.getByTestId('input');
			await expect(input).toHaveAttribute('aria-readonly', 'true');
			await expect(input).toHaveAttribute('readonly', '');

			await input.focus();
			await page.keyboard.type('x');
			await page.keyboard.press('Backspace');
			await expect(input).toHaveValue('Apple');
		});
	});
}

test('svelte SSR renders the closed input and the hidden input', async ({ request }) => {
	const html = await (await request.get('/fixtures/combobox?case=reset')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toMatch(/<input\b[^>]*\srole="combobox"/);
	expect(html).toMatch(
		/<input\b[^>]*\sname="fruit"[^>]*\svalue="Apple"|<input\b[^>]*\svalue="Apple"[^>]*\sname="fruit"/
	);
});
