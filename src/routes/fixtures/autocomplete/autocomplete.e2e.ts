// Each case runs against the Svelte Autocomplete and the React Base UI 1.9.0 reference.
// Base UI v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'autocomplete', scenario, reference);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('filters as you type and fills the input from an item', async ({ page }) => {
			const { errors } = await open(page, 'plain', reference);
			const input = page.getByTestId('input');
			await expect(input).toHaveAttribute('aria-expanded', 'false');
			await expect(input).toHaveAttribute('aria-autocomplete', 'list');

			await input.pressSequentially('fi');
			await expect(page.getByRole('listbox')).toBeVisible();
			await expect(page.getByRole('option')).toHaveText(['fix']);

			await page.getByRole('option', { name: 'fix' }).click();
			await expect(input).toHaveValue('fix');
			await expect(page.getByRole('listbox')).toBeHidden();
			await expect(input).toBeFocused();
			expect(errors).toEqual([]);
		});

		test('highlights with the keyboard through aria-activedescendant', async ({ page }) => {
			await open(page, 'plain', reference);
			const input = page.getByTestId('input');
			await input.pressSequentially('f');
			await expect(page.getByRole('option')).toHaveText(['feature', 'fix', 'refactor']);

			await page.keyboard.press('ArrowDown');
			const feature = page.getByRole('option', { name: 'feature' });
			await expect(feature).toHaveAttribute('data-highlighted', '');
			await expect(input).toHaveAttribute(
				'aria-activedescendant',
				(await feature.getAttribute('id'))!
			);
			await expect(input).toHaveValue('f');
			await expect(input).toBeFocused();

			await page.keyboard.press('ArrowDown');
			await page.keyboard.press('Enter');
			await expect(input).toHaveValue('fix');
			await expect(page.getByRole('listbox')).toBeHidden();
		});

		test('completes inline with the highlighted item in both mode', async ({ page }) => {
			await open(page, 'inline', reference);
			const input = page.getByTestId('input');
			await expect(input).toHaveAttribute('aria-autocomplete', 'both');
			await input.pressSequentially('f');

			await page.keyboard.press('ArrowDown');
			await expect(input).toHaveValue('feature');
			await expect(page.getByRole('option')).toHaveText(['feature', 'fix', 'refactor']);

			await page.keyboard.press('ArrowDown');
			await expect(input).toHaveValue('fix');

			await page.keyboard.press('Enter');
			await expect(input).toHaveValue('fix');
			await expect(page.getByRole('listbox')).toBeHidden();
		});

		test('shows the empty state when nothing matches', async ({ page }) => {
			await open(page, 'plain', reference);
			await page.getByTestId('input').pressSequentially('zz');

			await expect(page.getByRole('option')).toHaveCount(0);
			await expect(page.getByTestId('empty')).toHaveText('No tags found');
		});

		test('clears the typed text with the clear button', async ({ page }) => {
			await open(page, 'plain', reference);
			const input = page.getByTestId('input');
			await input.pressSequentially('bug');
			await expect(input).toHaveValue('bug');

			await page.getByTestId('clear').click();
			await expect(input).toHaveValue('');
			await expect(page.getByTestId('clear')).toHaveCount(0);
			await expect(input).toBeFocused();
		});

		test('blocks an empty required submit, then submits the typed text', async ({ page }) => {
			await open(page, 'form', reference);
			await expect(page.getByRole('combobox', { name: 'Tag' })).toBeVisible();
			await expect(page.getByTestId('error')).toHaveCount(0);

			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByText('Required')).toBeVisible();
			await expect(page.getByTestId('submitted')).toHaveText('0');
			await expect(page.getByTestId('field')).toHaveAttribute('data-invalid', '');

			await page.getByTestId('input').pressSequentially('custom tag');
			await page.keyboard.press('Escape');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByTestId('submitted')).toHaveText('1');
			await expect(page.getByTestId('values')).toHaveText(JSON.stringify({ tag: 'custom tag' }));
		});

		test('restores the default text on a native form reset', async ({ page }) => {
			await open(page, 'reset', reference);
			const input = page.getByTestId('input');
			await expect(input).toHaveAttribute('name', 'tag');
			await expect(input).toHaveValue('docs');

			await input.fill('');
			await input.pressSequentially('bug');
			await expect(input).toHaveValue('bug');
			await page.keyboard.press('Escape');

			await page.getByRole('button', { name: 'Reset' }).click();
			// React Base UI keeps its state on a native reset. See "Form reset" in
			// docs/upstream-differences.md.
			await expect(input).toHaveValue(reference ? 'bug' : 'docs');
		});

		test('does not open when disabled', async ({ page }) => {
			await open(page, 'disabled', reference);
			const input = page.getByTestId('input');
			await expect(input).toBeDisabled();
			await page.getByTestId('trigger').click({ force: true });
			await expect(page.getByRole('listbox')).toHaveCount(0);
			await expect(input).toHaveValue('docs');
		});

		test('keeps the text when read-only', async ({ page }) => {
			await open(page, 'readonly', reference);
			const input = page.getByTestId('input');
			await expect(input).toHaveAttribute('readonly', '');
			await expect(input).toHaveAttribute('aria-autocomplete', 'none');

			await input.focus();
			await page.keyboard.type('x');
			await page.keyboard.press('Backspace');
			await expect(input).toHaveValue('docs');
		});
	});
}

test('svelte SSR renders the input with the name and default text', async ({ request }) => {
	const html = await (await request.get('/fixtures/autocomplete?case=reset')).text();
	expect(html).toContain('data-hydrated="false"');
	const input = html.match(/<input\b[^>]*\srole="combobox"[^>]*>/)?.[0] ?? '';
	expect(input).toContain('name="tag"');
	expect(input).toContain('value="docs"');
	expect(html.match(/\sname="tag"/g)).toHaveLength(1);
});
