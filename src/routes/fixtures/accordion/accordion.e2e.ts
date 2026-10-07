// Each case runs against the Svelte Accordion and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/accordion?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { errors };
}

async function calls(page: Page) {
	return JSON.parse(await page.getByTestId('calls').innerText()) as {
		value: string[];
		reason: string;
		canceled: boolean;
	}[];
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('exclusive clicks leave one panel open', async ({ page }) => {
			const { errors } = await open(page, 'exclusive', reference);
			const root = page.getByTestId('root');
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });

			await expect(root).toHaveAttribute('data-orientation', 'vertical');
			await expect(root).not.toHaveAttribute('multiple');
			await expect(one).toHaveAttribute('aria-expanded', 'false');
			await expect(one).toHaveAttribute('type', 'button');

			await one.click();
			await expect(one).toHaveAttribute('aria-expanded', 'true');
			await expect(one).toHaveAttribute('data-panel-open', '');
			await expect(page.getByTestId('panel-one')).toHaveAttribute('data-open', '');
			await expect(page.getByTestId('panel-one')).toHaveAttribute('role', 'region');
			await expect(page.getByTestId('panel-two')).toHaveCount(0);
			expect(await calls(page)).toEqual([
				{ value: ['one'], reason: 'trigger-press', canceled: false }
			]);

			await two.click();
			await expect(one).toHaveAttribute('aria-expanded', 'false');
			await expect(two).toHaveAttribute('aria-expanded', 'true');
			await expect(page.getByTestId('panel-one')).toHaveCount(0);
			await expect(page.getByTestId('panel-two')).toHaveAttribute('data-open', '');
			expect(errors).toEqual([]);
		});

		test('multiple keeps each opened panel', async ({ page }) => {
			await open(page, 'multiple', reference);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });

			await one.click();
			await two.click();
			await expect(page.getByTestId('panel-one')).toHaveAttribute('data-open', '');
			await expect(page.getByTestId('panel-two')).toHaveAttribute('data-open', '');
			await expect(one).toHaveAttribute('data-panel-open', '');
			await expect(two).toHaveAttribute('data-panel-open', '');

			await one.click();
			await expect(page.getByTestId('panel-one')).toHaveCount(0);
			await expect(page.getByTestId('panel-two')).toHaveAttribute('data-open', '');
		});

		test('a disabled root does not open or call back', async ({ page }) => {
			await open(page, 'disabled', reference);
			const one = page.getByRole('button', { name: 'One' });

			await expect(one).toHaveAttribute('aria-disabled', 'true');
			await expect(one).toHaveAttribute('data-disabled', '');
			await one.focus();
			await expect(one).toBeFocused();
			await page.keyboard.press('Enter');
			// Playwright will not click an aria-disabled button unless forced.
			await one.click({ force: true });
			await expect(one).toHaveAttribute('aria-expanded', 'false');
			await expect(page.getByTestId('panel-one')).toHaveCount(0);
			expect(await calls(page)).toEqual([]);
		});

		test('cancel leaves the panel closed', async ({ page }) => {
			await open(page, 'cancel', reference);
			const one = page.getByRole('button', { name: 'One' });

			await one.click();
			await expect(one).toHaveAttribute('aria-expanded', 'false');
			await expect(page.getByTestId('panel-one')).toHaveCount(0);
			expect(await calls(page)).toEqual([
				{ value: ['one'], reason: 'trigger-press', canceled: true }
			]);
		});

		test('the owner and the trigger share the open item', async ({ page }) => {
			await open(page, 'bound', reference);
			const one = page.getByRole('button', { name: 'One' });
			const owner = page.getByRole('checkbox', { name: 'Owner one' });

			await one.click();
			await expect(one).toHaveAttribute('aria-expanded', 'true');
			await expect(owner).toBeChecked();
			expect(await calls(page)).toEqual([
				{ value: ['one'], reason: 'trigger-press', canceled: false }
			]);

			await owner.click();
			await expect(one).toHaveAttribute('aria-expanded', 'false');
			await expect(page.getByTestId('panel-one')).toHaveCount(0);
		});

		test('preventDefault skips the toggle', async ({ page }) => {
			await open(page, 'prevented', reference);
			const one = page.getByRole('button', { name: 'One' });

			await one.click();
			await expect(one).toHaveAttribute('aria-expanded', 'false');
			expect(await calls(page)).toEqual([]);
		});

		test('keepMounted leaves a closed panel in the document', async ({ page }) => {
			await open(page, 'mounted', reference);
			const panel = page.getByTestId('panel-one');

			await expect(panel).toHaveAttribute('hidden', '');
			await expect(panel).toHaveAttribute('data-closed', '');
			await page.getByRole('button', { name: 'One' }).click();
			await expect(panel).not.toHaveAttribute('hidden');
			await expect(panel).toHaveAttribute('data-open', '');
		});

		test('an initially open panel is expanded', async ({ page }) => {
			await open(page, 'open', reference);
			const one = page.getByRole('button', { name: 'One' });
			const panel = page.getByTestId('panel-one');

			await expect(one).toHaveAttribute('aria-expanded', 'true');
			await expect(panel).toBeVisible();
			await expect(panel).toHaveAttribute('data-open', '');
			await one.click();
			await expect(one).toHaveAttribute('aria-expanded', 'false');
			await expect(page.getByTestId('panel-one')).toHaveCount(0);
		});

		test('beforematch opens a hidden-until-found panel', async ({ page }) => {
			await open(page, 'search', reference);
			const panel = page.getByTestId('panel-one');
			const one = page.getByRole('button', { name: 'One' });

			await expect(panel).toHaveAttribute('hidden', 'until-found');
			await panel.evaluate((element) => {
				element.dispatchEvent(new Event('beforematch', { bubbles: true }));
			});
			await expect(one).toHaveAttribute('aria-expanded', 'true');
			await expect(panel).toHaveAttribute('data-open', '');
			expect(await calls(page)).toEqual([{ value: ['one'], reason: 'none', canceled: false }]);
		});

		test('Enter opens the focused trigger', async ({ page }) => {
			await open(page, 'exclusive', reference);
			const one = page.getByRole('button', { name: 'One' });

			await one.focus();
			await page.keyboard.press('Enter');
			await expect(one).toHaveAttribute('aria-expanded', 'true');
			await expect(page.getByTestId('panel-one')).toHaveAttribute('data-open', '');
		});
	});
}

test('svelte SSR renders a closed trigger before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/accordion?case=exclusive')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('aria-expanded="false"');
	expect(html).toContain('data-orientation="vertical"');
	expect(html).not.toContain('Panel one');
});

test('svelte SSR renders an open panel before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/accordion?case=open')).text();
	expect(html).toContain('aria-expanded="true"');
	expect(html).toContain('Panel one');
	expect(html).toContain('data-open');
	expect(html).toContain('role="region"');
	expect(html).toContain('animation-name:none');
});
