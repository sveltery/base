// Each case runs against the Svelte Tooltip and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/tooltip?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return {
		trigger: page.getByRole('button', { name: 'Info' }),
		popup: page.getByTestId('Info-popup'),
		positioner: page.getByTestId('Info-positioner'),
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
		test('hover opens after the default delay', async ({ page }) => {
			const { trigger, popup, outside, errors } = await open(page, 'delay', reference);
			await trigger.hover();
			await page.waitForTimeout(300);
			await expect(popup).toHaveCount(0);
			await expect(popup).toBeVisible();
			await expect(popup).toHaveText('Info tooltip');
			await expect(trigger).toHaveAttribute('data-popup-open', '');
			expect(await recorded(page)).toEqual([
				{ open: true, reason: 'trigger-hover', canceled: false }
			]);

			await outside.hover();
			await expect(popup).toHaveCount(0);
			expect(errors).toEqual([]);
		});

		test('keyboard focus opens and escape closes', async ({ page }) => {
			const { trigger, popup, outside } = await open(page, 'standalone', reference);
			await outside.focus();
			await page.keyboard.press('Tab');
			await expect(trigger).toBeFocused();
			await expect(popup).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(popup).toHaveCount(0);
			expect(await recorded(page)).toEqual([
				{ open: true, reason: 'trigger-focus', canceled: false },
				{ open: false, reason: 'escape-key', canceled: false }
			]);
		});

		test('clicking the trigger closes the tooltip', async ({ page }) => {
			const { trigger, popup } = await open(page, 'standalone', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();
			await trigger.click();
			await expect(popup).toHaveCount(0);
			// Base UI React also reports two trigger-press closes for one click.
			expect(await recorded(page)).toEqual([
				{ open: true, reason: 'trigger-hover', canceled: false },
				{ open: false, reason: 'trigger-press', canceled: false },
				{ open: false, reason: 'trigger-press', canceled: false }
			]);
		});

		test('closeOnClick false keeps the tooltip open on click', async ({ page }) => {
			const { trigger, popup } = await open(page, 'no-close-on-click', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();
			await trigger.click();
			await page.waitForTimeout(200);
			await expect(popup).toBeVisible();
		});

		test('a disabled root does not open', async ({ page }) => {
			const { trigger, popup } = await open(page, 'disabled', reference);
			await trigger.hover();
			await page.waitForTimeout(200);
			await expect(popup).toHaveCount(0);
			await trigger.focus();
			await page.waitForTimeout(100);
			await expect(popup).toHaveCount(0);
			expect(await recorded(page)).toEqual([]);
		});

		test('bound open follows outside changes and writes hover back', async ({ page }) => {
			const { trigger, popup } = await open(page, 'bound', reference);
			const toggle = page.getByRole('button', { name: 'Toggle externally' });
			const bound = page.getByTestId('bound');
			// A pointer press on the toggle would be an outside press that closes the tooltip first.
			await toggle.press('Enter');
			await expect(popup).toBeVisible();
			await expect(bound).toHaveText('true');
			await toggle.press('Enter');
			await expect(popup).toHaveCount(0);
			await expect(bound).toHaveText('false');

			await trigger.hover();
			await expect(popup).toBeVisible();
			await expect(bound).toHaveText('true');
			expect(await recorded(page)).toEqual([
				{ open: true, reason: 'trigger-hover', canceled: false }
			]);
		});

		test('canceling onOpenChange keeps the tooltip closed', async ({ page }) => {
			const { trigger, popup } = await open(page, 'cancel', reference);
			await trigger.hover();
			await page.waitForTimeout(200);
			await expect(popup).toHaveCount(0);
			expect((await recorded(page))[0]).toEqual({
				open: true,
				reason: 'trigger-hover',
				canceled: true
			});
		});

		test('a provider opens the next trigger instantly', async ({ page }) => {
			await open(page, 'provider', reference);
			const first = page.getByRole('button', { name: 'First' });
			const second = page.getByRole('button', { name: 'Second' });
			const firstPopup = page.getByTestId('First-popup');
			const secondPopup = page.getByTestId('Second-popup');

			await first.hover();
			await page.waitForTimeout(300);
			await expect(firstPopup).toHaveCount(0);
			await expect(firstPopup).toBeVisible();

			await second.hover();
			await expect(secondPopup).toBeVisible({ timeout: 300 });
			await expect(secondPopup).toHaveAttribute('data-instant', 'delay');
			await expect(firstPopup).toHaveCount(0);
		});

		test('the popup stays open while hovered', async ({ page }) => {
			const { trigger, popup } = await open(page, 'standalone', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();
			await popup.hover();
			await page.waitForTimeout(300);
			await expect(popup).toBeVisible();
		});

		test('disableHoverablePopup closes when the pointer reaches the popup', async ({ page }) => {
			const { trigger, popup } = await open(page, 'unhoverable', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();
			const box = (await popup.boundingBox())!;
			await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
			await expect(popup).toHaveCount(0);
		});

		test('a detached trigger opens its handle root', async ({ page }) => {
			const { trigger, popup } = await open(page, 'detached', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();
			await expect(trigger).toHaveAttribute('data-popup-open', '');
		});

		test('trackCursorAxis follows the pointer on x', async ({ page }) => {
			const { trigger, positioner, popup } = await open(page, 'cursor', reference);
			const box = (await trigger.boundingBox())!;
			await page.mouse.move(box.x + 50, box.y + 20);
			await expect(popup).toBeVisible();
			await expect
				.poll(async () => Math.round((await positioner.boundingBox())!.width) > 0)
				.toBe(true);
			const centerAt = async () => {
				const rect = (await positioner.boundingBox())!;
				return Math.round(rect.x + rect.width / 2 - box.x);
			};
			await expect.poll(centerAt).toBe(50);
			const top = (await positioner.boundingBox())!.y;

			await page.mouse.move(box.x + 300, box.y + 20, { steps: 5 });
			await expect.poll(centerAt).toBe(300);
			expect((await positioner.boundingBox())!.y).toBe(top);
		});
	});
}
