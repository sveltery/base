// Each case runs against the Svelte Dialog and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';
import { readOpenCalls } from '../read-output.js';

function openDialog(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'dialog', scenario, reference);
}

function openButton(page: Page) {
	return page.getByRole('button', { name: 'Open', exact: true, includeHidden: true });
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('click opens the dialog and Escape closes it', async ({ page }) => {
			const { errors } = await openDialog(page, 'standalone', reference);
			const opener = openButton(page);
			await expect(opener).toHaveAttribute('aria-expanded', 'false');
			await opener.click();
			const dialog = page.getByRole('dialog');
			await expect(dialog).toHaveAttribute('data-open', '');
			await expect(dialog).toHaveAttribute('aria-labelledby');
			await expect(opener).toHaveAttribute('aria-expanded', 'true');
			expect(await readOpenCalls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false }
			]);

			await page.keyboard.press('Escape');
			await expect(dialog).toHaveCount(0);
			expect(await readOpenCalls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false },
				{ open: false, reason: 'escape-key', canceled: false }
			]);
			expect(errors).toEqual([]);
		});

		test('the close button closes the dialog', async ({ page }) => {
			await openDialog(page, 'standalone', reference);
			await openButton(page).click();
			await page.getByRole('button', { name: 'Close' }).click();
			await expect(page.getByRole('dialog')).toHaveCount(0);
			expect(await readOpenCalls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false },
				{ open: false, reason: 'close-press', canceled: false }
			]);
		});

		test('a non-modal dialog closes from an outside click', async ({ page }) => {
			await openDialog(page, 'outside', reference);
			await openButton(page).click();
			await page.getByTestId('outside').click();
			await expect(page.getByRole('dialog')).toHaveCount(0);
			// The outside control is a button. Focusing it leaves the popup before the click,
			// so both this port and Base UI close with focus-out.
			expect((await readOpenCalls(page)).at(-1)).toEqual({
				open: false,
				reason: 'focus-out',
				canceled: false
			});
		});

		test('canceling onOpenChange keeps the dialog closed', async ({ page }) => {
			await openDialog(page, 'cancel', reference);
			const opener = openButton(page);
			await opener.click();
			await expect(opener).toHaveAttribute('aria-expanded', 'false');
			await expect(page.getByRole('dialog')).toHaveCount(0);
			expect(await readOpenCalls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: true }
			]);
		});

		test('a disabled trigger does not open the dialog', async ({ page }) => {
			await openDialog(page, 'disabled', reference);
			const opener = openButton(page);
			await expect(opener).toBeDisabled();
			await opener.click({ force: true });
			await expect(page.getByRole('dialog')).toHaveCount(0);
			expect(await readOpenCalls(page)).toEqual([]);
		});

		test('Escape closes only the nested dialog', async ({ page }) => {
			await openDialog(page, 'nested', reference);
			await openButton(page).click();
			await page.getByRole('button', { name: 'Nested' }).click();
			await expect(page.getByRole('dialog', { includeHidden: true })).toHaveCount(2);
			await page.keyboard.press('Escape');
			await expect(page.getByRole('dialog')).toHaveCount(1);
			await expect(page.getByRole('dialog')).toContainText('Title');
		});

		test('a nested dialog that is already open stays open', async ({ page }) => {
			const { errors } = await openDialog(page, 'nested-open', reference);
			await expect(page.getByRole('dialog', { includeHidden: true })).toHaveCount(2);
			await expect(page.getByRole('button', { name: 'Nested inside' })).toBeFocused();
			expect(await readOpenCalls(page)).toEqual([]);
			expect(errors).toEqual([]);
		});

		test('opening the outer dialog keeps an already-open nested dialog', async ({ page }) => {
			const { errors } = await openDialog(page, 'nested-onto', reference);
			await expect(page.getByRole('dialog')).toHaveCount(0);
			await openButton(page).click();
			await expect(page.getByRole('dialog', { includeHidden: true })).toHaveCount(2);
			await expect(page.getByRole('button', { name: 'Nested inside' })).toBeFocused();
			expect(await readOpenCalls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false }
			]);
			expect(errors).toEqual([]);
		});

		test('a nested popover that is already open stays open', async ({ page }) => {
			const { errors } = await openDialog(page, 'nested-popover', reference);
			await expect(page.getByRole('dialog', { includeHidden: true })).toHaveCount(2);
			await expect(page.getByRole('button', { name: 'Nested inside' })).toBeFocused();
			expect(await readOpenCalls(page)).toEqual([]);
			expect(errors).toEqual([]);
		});

		test('initial focus moves inside and returns to the trigger', async ({ page }) => {
			await openDialog(page, 'focus', reference);
			const opener = openButton(page);
			await opener.click();
			await expect(page.getByRole('button', { name: 'Inside' })).toBeFocused();
			await page.getByRole('button', { name: 'Close' }).click();
			await expect(opener).toBeFocused();
		});
	});
}

test('svelte SSR omits a closed dialog popup', async ({ request }) => {
	const html = await (await request.get('/fixtures/dialog?case=standalone')).text();
	expect(html).toContain('aria-expanded="false"');
	expect(html).not.toContain('role="dialog"');
	expect(html).toContain('data-hydrated="false"');
});
