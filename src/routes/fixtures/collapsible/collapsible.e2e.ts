// Each case runs against the Svelte Collapsible and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/collapsible?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return {
		trigger: page.getByRole('button', { name: 'Details' }),
		panel: page.getByTestId('panel'),
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
		test('click opens and closes the panel', async ({ page }) => {
			const { trigger, panel, errors } = await open(page, 'standalone', reference);
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect(trigger).not.toHaveAttribute('aria-controls');
			await expect(panel).toHaveCount(0);

			await trigger.click();
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect(trigger).toHaveAttribute('data-panel-open', '');
			await expect(panel).toHaveAttribute('data-open', '');
			await expect(panel).toHaveText('Panel content');
			expect(await calls(page)).toEqual([{ open: true, reason: 'trigger-press', canceled: false }]);

			await trigger.click();
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect(panel).toHaveCount(0);
			expect(errors).toEqual([]);
		});

		test('keyboard Space and Enter toggle the panel', async ({ page }) => {
			const { trigger, panel } = await open(page, 'standalone', reference);
			await trigger.focus();
			await page.keyboard.press('Space');
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect(panel).toBeVisible();
			await page.keyboard.press('Enter');
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect(panel).toHaveCount(0);
		});

		test('owner-held open follows the owner and receives clicks', async ({ page }) => {
			const { trigger } = await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner open' });
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await owner.check();
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			await trigger.click();
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect(owner).not.toBeChecked();
			expect(await calls(page)).toEqual([
				{ open: false, reason: 'trigger-press', canceled: false }
			]);
		});

		test('canceling onOpenChange keeps the panel closed', async ({ page }) => {
			const { trigger, panel } = await open(page, 'cancel', reference);
			await trigger.click();
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect(panel).toHaveCount(0);
			expect(await calls(page)).toEqual([{ open: true, reason: 'trigger-press', canceled: true }]);
		});

		test('disabled stays focusable and does not open', async ({ page }) => {
			const { trigger, panel } = await open(page, 'disabled', reference);
			await expect(trigger).toHaveAttribute('aria-disabled', 'true');
			await expect(trigger).toHaveAttribute('data-disabled', '');
			await trigger.focus();
			await expect(trigger).toBeFocused();
			await page.keyboard.press('Enter');
			// Playwright will not click an aria-disabled button unless forced.
			await trigger.click({ force: true });
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect(panel).toHaveCount(0);
			expect(await calls(page)).toEqual([]);
		});

		// Svelte calls event.preventDefault(); React calls event.preventBaseUIHandler().
		test('consumer click can skip the trigger handler', async ({ page }) => {
			const { trigger, panel } = await open(page, 'prevented', reference);
			await trigger.click();
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect(panel).toHaveCount(0);
			expect(await calls(page)).toEqual([]);
		});

		test('keepMounted leaves a hidden closed panel in the document', async ({ page }) => {
			const { trigger, panel } = await open(page, 'mounted', reference);
			await expect(panel).toHaveCount(1);
			await expect(panel).toHaveAttribute('hidden', '');
			await expect(panel).toHaveAttribute('data-closed', '');
			await trigger.click();
			await expect(panel).toBeVisible();
			await expect(panel).toHaveAttribute('data-open', '');
			await trigger.click();
			await expect(panel).toHaveAttribute('hidden', '');
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
		});

		test('hiddenUntilFound opens from beforematch', async ({ page }) => {
			const { trigger, panel } = await open(page, 'search', reference);
			await expect(panel).toHaveAttribute('hidden', 'until-found');
			await panel.evaluate((element) => {
				element.dispatchEvent(new Event('beforematch', { bubbles: true }));
			});
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect(panel).toHaveAttribute('data-open', '');
			expect(await calls(page)).toEqual([{ open: true, reason: 'none', canceled: false }]);
		});

		test('an initially open panel is expanded', async ({ page }) => {
			const { trigger, panel } = await open(page, 'open', reference);
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect(panel).toBeVisible();
			await expect(panel).toHaveAttribute('data-open', '');
			await trigger.click();
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
		});
	});
}

test('svelte SSR renders a closed trigger before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/collapsible?case=standalone')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('aria-expanded="false"');
	expect(html).not.toContain('Panel content');
});

test('svelte SSR renders an open panel before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/collapsible?case=open')).text();
	expect(html).toContain('aria-expanded="true"');
	expect(html).toContain('Panel content');
	expect(html).toContain('data-open');
	expect(html).toContain('animation-name:none');
});
