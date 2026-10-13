// Each case runs against the Svelte PreviewCard and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/preview-card?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return {
		trigger: page.getByRole('link', { name: 'Link' }),
		popup: page.getByTestId('popup'),
		outside: page.getByRole('button', { name: 'Outside' }),
		errors
	};
}

async function recorded(page: Page) {
	const text = await page.getByTestId('calls').innerText();
	return JSON.parse(text) as Array<{ open: boolean; reason: string; canceled: boolean }>;
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('hover opens the card after the delay', async ({ page }) => {
			const { trigger, popup, errors } = await open(page, 'standalone', reference);
			await expect(popup).toHaveCount(0);
			await expect(trigger).not.toHaveAttribute('data-popup-open');

			await trigger.hover();
			await expect(popup).toHaveCount(0);
			await expect(popup).toBeVisible();
			await expect(trigger).toHaveAttribute('data-popup-open', '');
			await expect(popup).toHaveAttribute('data-open', '');
			await expect(popup).toHaveText(/Content/);
			expect(await recorded(page)).toEqual([
				{ open: true, reason: 'trigger-hover', canceled: false }
			]);
			expect(errors).toEqual([]);
		});

		test('leaving the trigger closes the card after the close delay', async ({ page }) => {
			const { trigger, popup, outside } = await open(page, 'close-delay', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();

			await outside.hover();
			await expect(popup).toBeVisible();
			await expect(popup).toHaveCount(0);
			await expect(trigger).not.toHaveAttribute('data-popup-open');
			expect(await recorded(page)).toEqual([
				{ open: true, reason: 'trigger-hover', canceled: false },
				{ open: false, reason: 'trigger-hover', canceled: false }
			]);
		});

		test('keyboard focus opens the card and blur closes it', async ({ page }) => {
			const { trigger, popup } = await open(page, 'focus', reference);
			await page.keyboard.press('Tab');
			await page.keyboard.press('Tab');
			await page.keyboard.press('Tab');
			await expect(trigger).toBeFocused();
			await expect(popup).toBeVisible();
			await expect(trigger).toHaveAttribute('data-popup-open', '');

			await page.keyboard.press('Tab');
			await expect(popup).toHaveCount(0);
			expect(await recorded(page)).toEqual([
				{ open: true, reason: 'trigger-focus', canceled: false },
				{ open: false, reason: 'trigger-focus', canceled: false }
			]);
		});

		test('escape dismisses a focus-opened card', async ({ page }) => {
			const { trigger, popup } = await open(page, 'focus', reference);
			await trigger.focus();
			await page.keyboard.press('Shift+Tab');
			await page.keyboard.press('Tab');
			await expect(trigger).toBeFocused();
			await expect(popup).toBeVisible();

			await page.keyboard.press('Escape');
			await expect(popup).toHaveCount(0);
			expect((await recorded(page)).at(-1)).toEqual({
				open: false,
				reason: 'escape-key',
				canceled: false
			});
		});

		test('escape dismisses a hover-opened card', async ({ page }) => {
			const { trigger, popup } = await open(page, 'close-delay', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(popup).toHaveCount(0);
			expect((await recorded(page)).at(-1)).toEqual({
				open: false,
				reason: 'escape-key',
				canceled: false
			});
		});

		test('a bound open state opens the card and follows Escape', async ({ page }) => {
			const { popup, trigger } = await open(page, 'bound', reference);
			await page.getByTestId('show').click();
			await expect(popup).toBeVisible();
			await expect(page.getByTestId('owner')).toHaveText('true');
			await expect(trigger).toHaveAttribute('data-popup-open', '');

			await page.keyboard.press('Escape');
			await expect(popup).toHaveCount(0);
			await expect(page.getByTestId('owner')).toHaveText('false');
			expect(await recorded(page)).toEqual([
				{ open: false, reason: 'escape-key', canceled: false }
			]);
		});

		test('canceling onOpenChange keeps the card closed', async ({ page }) => {
			const { trigger, popup } = await open(page, 'cancel', reference);
			await trigger.hover();
			await expect.poll(async () => (await recorded(page)).length).toBe(1);
			await expect(popup).toHaveCount(0);
			await expect(trigger).not.toHaveAttribute('data-popup-open');
			expect(await recorded(page)).toEqual([
				{ open: true, reason: 'trigger-hover', canceled: true }
			]);
		});

		test('hovering the popup keeps the card open', async ({ page }) => {
			const { trigger, popup, outside } = await open(page, 'safe', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();

			const box = (await popup.boundingBox())!;
			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
			await page.waitForTimeout(700);
			await expect(popup).toBeVisible();

			await outside.hover();
			await expect(popup).toHaveCount(0);
		});

		test('a detached trigger opens the card', async ({ page }) => {
			const { trigger, popup } = await open(page, 'detached', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();
			await expect(popup).toHaveText(/Content/);
			await expect(trigger).toHaveAttribute('data-popup-open', '');
		});

		test('the popup shows the payload of the hovered trigger', async ({ page }) => {
			await open(page, 'payload', reference);
			const popup = page.getByTestId('popup');
			await page.getByRole('link', { name: 'First' }).hover();
			await expect(popup).toHaveText('Content one');

			await page.getByRole('link', { name: 'Second' }).hover();
			await expect(popup).toHaveText('Content two');
			await expect(popup).toHaveCount(1);
			await expect(page.getByRole('link', { name: 'Second' })).toHaveAttribute(
				'data-popup-open',
				''
			);
			await expect(page.getByRole('link', { name: 'First' })).not.toHaveAttribute(
				'data-popup-open'
			);
		});
	});
}

test('svelte SSR renders a closed trigger before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/preview-card?case=standalone')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('>Link<');
	expect(html).not.toContain('data-popup-open');
	expect(html).not.toContain('>Content<');
});
