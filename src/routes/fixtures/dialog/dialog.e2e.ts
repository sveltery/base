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
			const outside = page.getByTestId('outside');
			await outside.click();
			await expect(page.getByRole('dialog')).toHaveCount(0);
			await expect(outside).toBeFocused();
			// The outside control is a button. Focusing it leaves the popup before the click,
			// so both this port and Base UI close with focus-out and leave focus there.
			expect((await readOpenCalls(page)).at(-1)).toEqual({
				open: false,
				reason: 'focus-out',
				canceled: false
			});
		});

		test('typing into an outside input keeps the text', async ({ page }) => {
			await openDialog(page, 'outside', reference);
			await openButton(page).click();
			const input = page.getByTestId('outside-input');
			await input.click();
			await page.keyboard.type('kept');
			await expect(page.getByRole('dialog')).toHaveCount(0);
			await expect(input).toBeFocused();
			await expect(input).toHaveValue('kept');
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

		for (const [name, title] of [
			['nested-body', 'a nested popup portaled to the body keeps the parent open'],
			['child-initial', 'a child with initialFocus false keeps the parent open']
		] as const) {
			test(title, async ({ page }) => {
				await openDialog(page, name, reference);
				await openButton(page).click();
				await expect(page.getByTestId('parent-popup')).toBeVisible();
				await page.getByRole('button', { name: 'Nested' }).click();
				await expect(page.getByTestId('nested-popup')).toBeVisible();
				await page.getByTestId('nested-inside').focus();
				await page.evaluate(
					() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
				);
				await expect(page.getByTestId('parent-popup')).toBeVisible();
				await expect(page.getByTestId('nested-popup')).toBeVisible();
			});
		}

		test('inner finalFocus outside keeps the outer popup open', async ({ page }) => {
			await openDialog(page, 'final-focus', reference);
			await openButton(page).click();
			await page.getByRole('button', { name: 'Nested' }).click();
			await expect(page.getByRole('button', { name: 'Nested close' })).toBeFocused();
			await page.keyboard.press('Escape');
			await expect(page.getByTestId('parent-popup')).toBeVisible();
			await expect(page.getByTestId('final-target')).toBeFocused();
			await expect(page.getByTestId('nested-popup')).toHaveCount(0);
		});

		test('shift-tab from the open trigger lands on Before', async ({ page }) => {
			await openDialog(page, 'tab', reference);
			const opener = openButton(page);
			await opener.click();
			await expect(page.getByRole('button', { name: 'Inside' })).toBeFocused();
			await opener.focus();
			await page.keyboard.press('Shift+Tab');
			await expect(page.getByTestId('before')).toBeFocused();
			await expect(page.getByRole('dialog')).toHaveCount(0);
		});

		test('shift-tab from the first control focuses the trigger when the container sits between the trigger and the portal', async ({
			page
		}) => {
			await openDialog(page, 'tab-between', reference);
			const opener = openButton(page);
			await opener.click();
			await expect(page.getByRole('button', { name: 'Inside1' })).toBeFocused();
			await expect(
				page.getByRole('dialog').locator('xpath=ancestor::*[@data-testid="inline-container"]')
			).toHaveCount(1);
			await page.keyboard.press('Shift+Tab');
			await expect(opener).toBeFocused();
			await expect(page.getByRole('dialog')).toBeVisible();
			await page.keyboard.press('Shift+Tab');
			await expect(page.getByTestId('before')).toBeFocused();
			await expect(page.getByRole('dialog')).toHaveCount(0);
		});

		for (const scenario of ['tab', 'tab-inline'] as const) {
			test(`shift-tab from the first control focuses the trigger (${scenario})`, async ({
				page
			}) => {
				await openDialog(page, scenario, reference);
				const opener = openButton(page);
				await opener.click();
				await expect(page.getByRole('button', { name: 'Inside' })).toBeFocused();
				await page.keyboard.press('Shift+Tab');
				await expect(opener).toBeFocused();
				await expect(page.getByRole('dialog')).toBeVisible();
			});

			test(`tab from the open trigger enters the dialog (${scenario})`, async ({ page }) => {
				await openDialog(page, scenario, reference);
				const opener = openButton(page);
				await opener.click();
				await expect(page.getByRole('button', { name: 'Inside' })).toBeFocused();
				await opener.focus();
				await page.keyboard.press('Tab');
				await expect(page.getByRole('button', { name: 'Inside' })).toBeFocused();
				await expect(page.getByRole('dialog')).toBeVisible();
			});
		}

		test('tab from the last control closes onto After', async ({ page }) => {
			await openDialog(page, 'tab', reference);
			await openButton(page).click();
			await expect(page.getByRole('button', { name: 'Inside' })).toBeFocused();
			await page.keyboard.press('Tab');
			await expect(page.getByTestId('after')).toBeFocused();
			await expect(page.getByRole('dialog')).toHaveCount(0);
		});

		async function expectEscapeLandsOutside(page: Page) {
			await expect(page.getByTestId('nested-inside')).toBeFocused();
			await page.keyboard.press('Escape');
			await expect(page.getByTestId('outside')).toBeFocused();
			await expect(page.getByTestId('parent-popup')).toBeVisible();
			await expect(page.getByTestId('nested-popup')).toHaveCount(0);
		}

		test('escape on dialogs opened together keeps final focus outside', async ({ page }) => {
			await openDialog(page, 'together-outside', reference);
			await expect(page.getByTestId('parent-popup')).toBeVisible();
			await expect(page.getByTestId('nested-popup')).toBeVisible();
			await expectEscapeLandsOutside(page);
		});

		test('escape on an inner dialog keeps final focus outside', async ({ page }) => {
			await openDialog(page, 'final-outside', reference);
			await openButton(page).click();
			await page.getByRole('button', { name: 'Nested' }).click();
			await expectEscapeLandsOutside(page);
		});

		test('focusing one sibling non-modal dialog leaves the other open', async ({ page }) => {
			await openDialog(page, 'siblings', reference);
			await expect(page.getByTestId('popup-a')).toBeVisible();
			await expect(page.getByTestId('popup-b')).toBeVisible();
			await page.getByTestId('inside-b').focus();
			await page.evaluate(
				() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
			);
			await expect(page.getByTestId('popup-a')).toBeVisible();
			await expect(page.getByTestId('popup-b')).toBeVisible();
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
