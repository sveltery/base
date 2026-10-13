// Each case runs against the Svelte AlertDialog and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';
import { readOpenCalls } from '../read-output.js';

function openAlertDialog(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'alert-dialog', scenario, reference);
}

function openButton(page: Page) {
	return page.getByRole('button', { name: 'Open', exact: true, includeHidden: true });
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('click opens an alertdialog labelled by its title and description', async ({ page }) => {
			const { errors } = await openAlertDialog(page, 'standalone', reference);
			const opener = openButton(page);
			await expect(opener).toHaveAttribute('aria-haspopup', 'dialog');
			await expect(opener).toHaveAttribute('aria-expanded', 'false');
			await opener.click();

			const popup = page.getByRole('alertdialog');
			await expect(popup).toHaveAttribute('data-open', '');
			await expect(popup).toHaveAccessibleName('Title');
			await expect(popup).toHaveAccessibleDescription('Description');
			await expect(opener).toHaveAttribute('aria-expanded', 'true');
			await expect(opener).toHaveAttribute('aria-controls', (await popup.getAttribute('id'))!);
			await expect(page.getByRole('button', { name: 'Inside' })).toBeFocused();
			expect(errors).toEqual([]);
		});

		test('Escape closes it and focus returns to the trigger', async ({ page }) => {
			await openAlertDialog(page, 'standalone', reference);
			const opener = openButton(page);
			await opener.click();
			await expect(page.getByRole('alertdialog')).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(page.getByRole('alertdialog')).toHaveCount(0);
			await expect(opener).toBeFocused();
			expect(await readOpenCalls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false },
				{ open: false, reason: 'escape-key', canceled: false }
			]);
		});

		test('the close button closes it with close-press', async ({ page }) => {
			await openAlertDialog(page, 'standalone', reference);
			await openButton(page).click();
			await page.getByRole('button', { name: 'Close' }).click();
			await expect(page.getByRole('alertdialog')).toHaveCount(0);
			expect((await readOpenCalls(page)).at(-1)).toEqual({
				open: false,
				reason: 'close-press',
				canceled: false
			});
		});

		test('a click on the internal backdrop does not close it', async ({ page }) => {
			await openAlertDialog(page, 'standalone', reference);
			await openButton(page).click();
			await expect(page.getByRole('alertdialog')).toBeVisible();
			await page.mouse.click(5, 5);
			await expect(page.getByRole('alertdialog')).toHaveAttribute('data-open', '');
			expect(await readOpenCalls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false }
			]);
		});

		test('a click on the backdrop part does not close it', async ({ page }) => {
			await openAlertDialog(page, 'backdrop', reference);
			await openButton(page).click();
			const backdrop = page.getByTestId('backdrop');
			await expect(backdrop).toHaveAttribute('data-open', '');
			await expect(backdrop).toHaveAttribute('role', 'presentation');
			await page.mouse.click(5, 5);
			await expect(page.getByRole('alertdialog')).toHaveAttribute('data-open', '');
			expect(await readOpenCalls(page)).toHaveLength(1);
		});

		test('Tab stays inside the alert dialog', async ({ page }) => {
			await openAlertDialog(page, 'standalone', reference);
			await openButton(page).click();
			const inside = page.getByRole('button', { name: 'Inside' });
			const close = page.getByRole('button', { name: 'Close' });
			await expect(inside).toBeFocused();
			await page.keyboard.press('Tab');
			await expect(close).toBeFocused();
			await page.keyboard.press('Tab');
			await expect(inside).toBeFocused();
		});

		test('canceling onOpenChange keeps it closed', async ({ page }) => {
			await openAlertDialog(page, 'cancel', reference);
			const opener = openButton(page);
			await opener.click();
			await expect(opener).toHaveAttribute('aria-expanded', 'false');
			await expect(page.getByRole('alertdialog')).toHaveCount(0);
			expect(await readOpenCalls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: true }
			]);
		});

		test('detached triggers open it with their payload', async ({ page }) => {
			await openAlertDialog(page, 'detached', reference);
			const first = page.getByTestId('trigger-1');
			const second = page.getByTestId('trigger-2');
			await expect(page.getByTestId('root-payload')).toHaveText('No payload');

			await second.click();
			await expect(page.getByTestId('content')).toHaveText('2');
			await expect(second).toHaveAttribute('aria-expanded', 'true');
			await expect(second).toHaveAttribute('data-popup-open', '');
			await expect(first).toHaveAttribute('aria-expanded', 'false');
			await page.getByRole('button', { name: 'Close' }).click();
			await expect(page.getByRole('alertdialog')).toHaveCount(0);
			await expect(second).toBeFocused();

			await first.click();
			await expect(page.getByTestId('content')).toHaveText('1');
			await expect(first).toHaveAttribute('aria-expanded', 'true');
			await expect(second).toHaveAttribute('aria-expanded', 'false');
		});

		test('an alert dialog nested in a dialog closes alone on Escape', async ({ page }) => {
			await openAlertDialog(page, 'nested', reference);
			await openButton(page).click();
			const parent = page.getByTestId('parent-popup');
			await expect(parent).toHaveAttribute('data-open', '');
			await page.getByRole('button', { name: 'Delete' }).click();

			const alert = page.getByRole('alertdialog');
			await expect(alert).toHaveAttribute('data-nested', '');
			await expect(parent).toHaveAttribute('data-nested-dialog-open', '');
			await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused();

			await page.keyboard.press('Escape');
			await expect(alert).toHaveCount(0);
			await expect(parent).toHaveAttribute('data-open', '');
			await expect(parent).not.toHaveAttribute('data-nested-dialog-open');
			await expect(page.getByRole('button', { name: 'Delete' })).toBeFocused();
			expect(await readOpenCalls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false }
			]);
		});

		test('an initially open alert dialog renders the internal backdrop after hydration', async ({
			page
		}) => {
			await openAlertDialog(page, 'open', reference);
			await expect(page.getByRole('alertdialog')).toHaveAttribute('data-open', '');
			await expect(
				page.locator('[data-base-ui-portal] [role="presentation"][data-base-ui-inert]')
			).toHaveCount(1);
			await page.mouse.click(5, 5);
			await expect(page.getByRole('alertdialog')).toHaveAttribute('data-open', '');
		});
	});
}

test('svelte SSR omits the alert dialog popup', async ({ request }) => {
	for (const scenario of ['standalone', 'open']) {
		const html = await (await request.get(`/fixtures/alert-dialog?case=${scenario}`)).text();
		expect(html).toContain('aria-haspopup="dialog"');
		expect(html).toContain('aria-expanded="false"');
		expect(html).not.toContain('role="alertdialog"');
		expect(html).toContain('data-hydrated="false"');
	}
});
