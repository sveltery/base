// Each case runs against the Svelte Dialog and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/dialog?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return {
		trigger: page.getByRole('button', { name: 'Open', exact: true }),
		errors
	};
}

async function calls(page: Page) {
	return JSON.parse(await page.getByTestId('calls').innerText()) as {
		open: boolean;
		reason: string;
		canceled: boolean;
	}[];
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('click opens the dialog and Escape closes it', async ({ page }) => {
			const { trigger, errors } = await open(page, 'standalone', reference);
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await trigger.click();
			const dialog = page.getByRole('dialog');
			await expect(dialog).toHaveAttribute('data-open', '');
			await expect(dialog).toHaveAttribute('aria-labelledby');
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			expect(await calls(page)).toEqual([{ open: true, reason: 'trigger-press', canceled: false }]);

			await page.keyboard.press('Escape');
			await expect(dialog).toHaveCount(0);
			expect(await calls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false },
				{ open: false, reason: 'escape-key', canceled: false }
			]);
			expect(errors).toEqual([]);
		});

		test('the close button closes the dialog', async ({ page }) => {
			const { trigger } = await open(page, 'standalone', reference);
			await trigger.click();
			await page.getByRole('button', { name: 'Close' }).click();
			await expect(page.getByRole('dialog')).toHaveCount(0);
			expect(await calls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false },
				{ open: false, reason: 'close-press', canceled: false }
			]);
		});

		test('a non-modal dialog closes from an outside click', async ({ page }) => {
			const { trigger } = await open(page, 'outside', reference);
			await trigger.click();
			await page.getByTestId('outside').click();
			await expect(page.getByRole('dialog')).toHaveCount(0);
			expect((await calls(page)).at(-1)).toEqual({
				open: false,
				reason: 'outside-press',
				canceled: false
			});
		});

		test('canceling onOpenChange keeps the dialog closed', async ({ page }) => {
			const { trigger } = await open(page, 'cancel', reference);
			await trigger.click();
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect(page.getByRole('dialog')).toHaveCount(0);
			expect(await calls(page)).toEqual([{ open: true, reason: 'trigger-press', canceled: true }]);
		});

		test('a disabled trigger does not open the dialog', async ({ page }) => {
			const { trigger } = await open(page, 'disabled', reference);
			await expect(trigger).toBeDisabled();
			await trigger.click({ force: true });
			await expect(page.getByRole('dialog')).toHaveCount(0);
			expect(await calls(page)).toEqual([]);
		});

		test('Escape closes only the nested dialog', async ({ page }) => {
			const { trigger } = await open(page, 'nested', reference);
			await trigger.click();
			await page.getByRole('button', { name: 'Nested' }).click();
			await expect(page.getByRole('dialog')).toHaveCount(2);
			await page.keyboard.press('Escape');
			await expect(page.getByRole('dialog')).toHaveCount(1);
			await expect(page.getByRole('dialog')).toContainText('Title');
		});

		test('initial focus moves inside and returns to the trigger', async ({ page }) => {
			const { trigger } = await open(page, 'focus', reference);
			await trigger.click();
			await expect(page.getByRole('button', { name: 'Inside' })).toBeFocused();
			await page.getByRole('button', { name: 'Close' }).click();
			await expect(trigger).toBeFocused();
		});
	});
}

test('svelte SSR omits a closed dialog popup', async ({ request }) => {
	const html = await (await request.get('/fixtures/dialog?case=standalone')).text();
	expect(html).toContain('aria-expanded="false"');
	expect(html).not.toContain('role="dialog"');
	expect(html).toContain('data-hydrated="false"');
});
