// Each case runs against the Svelte Popover and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/popover?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return {
		trigger: page.getByRole('button', { name: 'Open' }),
		popup: page.getByRole('dialog'),
		outside: page.getByRole('button', { name: 'Outside' }),
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
		test('click opens and closes the popover', async ({ page }) => {
			const { trigger, popup, errors } = await open(page, 'standalone', reference);
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
			await expect(popup).toHaveCount(0);

			await trigger.click();
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect(trigger).toHaveAttribute('data-popup-open', '');
			await expect(trigger).toHaveAttribute('data-pressed', '');
			await expect(popup).toHaveAttribute('data-open', '');
			await expect(popup).toHaveText(/Content/);
			expect(await calls(page)).toEqual([{ open: true, reason: 'trigger-press', canceled: false }]);

			await trigger.click();
			await expect(popup).toHaveCount(0);
			expect(errors).toEqual([]);
		});

		test('escape and an outside click close the popover', async ({ page }) => {
			const { trigger, popup, outside } = await open(page, 'standalone', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(popup).toHaveCount(0);
			expect(await calls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false },
				{ open: false, reason: 'escape-key', canceled: false }
			]);

			await trigger.click();
			await outside.click();
			await expect(popup).toHaveCount(0);
		});

		test('canceling onOpenChange keeps the popover closed', async ({ page }) => {
			const { trigger, popup } = await open(page, 'cancel', reference);
			await trigger.click();
			await expect(popup).toHaveCount(0);
			expect(await calls(page)).toEqual([{ open: true, reason: 'trigger-press', canceled: true }]);
		});

		test('a disabled trigger does not open', async ({ page }) => {
			const { trigger, popup } = await open(page, 'disabled', reference);
			await expect(trigger).toBeDisabled();
			await trigger.click({ force: true });
			await expect(popup).toHaveCount(0);
			expect(await calls(page)).toEqual([]);
		});

		test('consumer click can skip the trigger handler', async ({ page }) => {
			const { trigger, popup } = await open(page, 'prevented', reference);
			await trigger.click();
			await expect(popup).toHaveCount(0);
			expect(await calls(page)).toEqual([]);
		});

		test('hover opens the popover and an outside hover closes it', async ({ page }) => {
			const { trigger, popup, outside } = await open(page, 'hover', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();
			await expect(trigger).not.toHaveAttribute('data-pressed');
			await outside.hover();
			await expect(popup).toHaveCount(0);
		});

		test('modal renders a backdrop and the close button dismisses', async ({ page }) => {
			const { trigger, popup } = await open(page, 'modal', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			await expect(page.locator('[role="presentation"]:not([data-side])')).not.toHaveCount(0);
			await page.getByRole('button', { name: 'Close' }).click();
			await expect(popup).toHaveCount(0);
		});

		test('an initially open popover is visible', async ({ page }) => {
			const { trigger, popup } = await open(page, 'open', reference);
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect(popup).toBeVisible();
			await trigger.click();
			await expect(popup).toHaveCount(0);
		});

		test('a detached trigger opens the popover', async ({ page }) => {
			const { trigger, popup } = await open(page, 'detached', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			await expect(popup).toHaveText(/Content/);
		});
	});
}

test('svelte SSR renders a closed trigger before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/popover?case=standalone')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('aria-expanded="false"');
	expect(html).toContain('aria-haspopup="dialog"');
	expect(html).not.toContain('>Content<');
});

test('svelte SSR renders an open popover before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/popover?case=open')).text();
	expect(html).toContain('aria-expanded="true"');
	expect(html).toContain('role="dialog"');
	expect(html).toContain('Content');
});
