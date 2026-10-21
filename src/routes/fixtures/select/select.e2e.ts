// Each case runs against the Svelte Select and the React Base UI 1.9.0 reference.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'select', scenario, reference);
}

async function centerY(locator: Locator) {
	const box = await locator.boundingBox();
	if (!box) throw new Error('not rendered');
	return box.y + box.height / 2;
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('opens on click and selects an option', async ({ page }) => {
			const { errors } = await open(page, 'plain', reference);
			const control = page.getByTestId('control');
			await expect(control).toHaveAttribute('aria-expanded', 'false');
			await expect(page.getByTestId('value')).toHaveText('Pick a fruit');

			await control.click();
			await expect(page.getByRole('listbox')).toBeVisible();
			await expect(control).toHaveAttribute('aria-expanded', 'true');

			await page.getByRole('option', { name: 'Banana' }).click();
			await expect(page.getByTestId('value')).toHaveText('Banana');
			await expect(control).toHaveAttribute('aria-expanded', 'false');
			await expect(page.getByRole('listbox')).toBeHidden();
			expect(errors).toEqual([]);
		});

		test('opens from the keyboard and selects the highlighted option', async ({ page }) => {
			await open(page, 'plain', reference);
			await page.getByTestId('control').focus();

			await page.keyboard.press('ArrowDown');
			await expect(page.getByRole('listbox')).toBeVisible();
			await expect(page.getByRole('option', { name: 'Apple' })).toBeFocused();

			await page.keyboard.press('ArrowDown');
			await expect(page.getByRole('option', { name: 'Banana' })).toHaveAttribute(
				'data-highlighted',
				''
			);
			await page.keyboard.press('Enter');
			await expect(page.getByTestId('value')).toHaveText('Banana');
			await expect(page.getByRole('listbox')).toBeHidden();
			await expect(page.getByTestId('control')).toBeFocused();
		});

		test('selects a match typed on the closed trigger', async ({ page }) => {
			await open(page, 'plain', reference);
			await page.getByTestId('control').focus();
			await page.keyboard.type('c');
			await expect(page.getByTestId('value')).toHaveText('Cherry');
			await expect(page.getByRole('listbox')).toHaveCount(0);
		});

		test('highlights a typed match in the open popup', async ({ page }) => {
			await open(page, 'plain', reference);
			await page.getByTestId('control').click();
			await expect(page.getByRole('listbox')).toBeVisible();
			await page.keyboard.type('ch');
			await expect(page.getByRole('option', { name: 'Cherry' })).toBeFocused();
			await page.keyboard.press('Enter');
			await expect(page.getByTestId('value')).toHaveText('Cherry');
		});

		test('keeps the popup open and lists every value in multiple mode', async ({ page }) => {
			await open(page, 'multiple', reference);
			await page.getByTestId('control').click();
			await page.getByRole('option', { name: 'Apple' }).click();
			await page.getByRole('option', { name: 'Cherry' }).click();

			await expect(page.getByRole('listbox')).toBeVisible();
			await expect(page.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true');
			await expect(page.getByRole('option', { name: 'Apple' })).toHaveAttribute(
				'aria-selected',
				'true'
			);
			await expect(page.getByRole('option', { name: 'Banana' })).toHaveAttribute(
				'aria-selected',
				'false'
			);
			await expect(page.getByTestId('value')).toHaveText('Apple, Cherry');
		});

		test('blocks an empty required submit, then submits the value', async ({ page }) => {
			await open(page, 'form', reference);
			await expect(page.getByRole('combobox', { name: 'Fruit' })).toBeVisible();
			await expect(page.getByTestId('error')).toHaveCount(0);

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByText('Required')).toBeVisible();
			await expect(page.getByTestId('submitted')).toHaveText('0');
			await expect(page.getByTestId('field')).toHaveAttribute('data-invalid', '');

			await page.getByTestId('control').click();
			await page.getByRole('option', { name: 'Banana' }).click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByTestId('submitted')).toHaveText('1');
			await expect(page.getByTestId('values')).toHaveText(JSON.stringify({ fruit: 'banana' }));
		});

		test('restores the default value on a native form reset', async ({ page }) => {
			await open(page, 'reset', reference);
			const hidden = page.locator('[name="fruit"]');
			await expect(hidden).toHaveValue('apple');

			await page.getByTestId('control').click();
			await page.getByRole('option', { name: 'Cherry' }).click();
			await expect(page.getByTestId('value')).toHaveText('Cherry');
			await expect(hidden).toHaveValue('cherry');

			await page.getByRole('button', { name: 'Reset' }).click();
			// React Base UI keeps its state on a native reset. See "Form reset" in
			// docs/upstream-differences.md.
			await expect(page.getByTestId('value')).toHaveText(reference ? 'Cherry' : 'Apple');
			if (!reference) await expect(hidden).toHaveValue('apple');
		});

		test('does not open when disabled', async ({ page }) => {
			await open(page, 'disabled', reference);
			const control = page.getByTestId('control');
			await expect(control).toHaveAttribute('data-disabled', '');
			await control.click({ force: true });
			await expect(page.getByRole('listbox')).toHaveCount(0);
			await expect(page.getByTestId('value')).toHaveText('Apple');
		});

		test('keeps the value when read-only', async ({ page }) => {
			await open(page, 'readonly', reference);
			const control = page.getByTestId('control');
			await expect(control).toHaveAttribute('data-readonly', '');
			await expect(control).toHaveAttribute('aria-readonly', 'true');

			await control.click();
			await expect(page.getByRole('listbox')).toBeVisible();
			await page.getByRole('option', { name: 'Banana' }).click();
			await expect(page.getByTestId('value')).toHaveText('Apple');
		});

		test('aligns the selected item with the trigger', async ({ page }) => {
			await open(page, 'aligned', reference);
			await page.getByTestId('control').click();
			await expect(page.getByTestId('positioner')).toHaveAttribute('data-side', 'none');
			await expect
				.poll(async () =>
					Math.abs(
						(await centerY(page.getByTestId('value'))) -
							(await centerY(page.getByTestId('text-banana')))
					)
				)
				.toBeLessThan(1);
		});
	});
}

test('svelte SSR renders the closed trigger and the hidden select', async ({ request }) => {
	const html = await (await request.get('/fixtures/select?case=reset')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toMatch(/<button\b[^>]*\srole="combobox"/);
	const select = html.match(/<select\b[^>]*\sname="fruit"[^>]*>.*?<\/select>/s)?.[0] ?? '';
	expect(select).toMatch(/<option value="apple"[^>]*\sselected/);
	expect(select).not.toMatch(/<option value="banana"[^>]*\sselected/);
});
