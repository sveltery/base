// Each case runs against the Svelte Drawer and the React Base UI 1.9.0 reference.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';
import { readOpenCalls, readOutput } from '../read-output.js';

function openDrawer(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'drawer', scenario, reference);
}

function openButton(page: Page) {
	return page.getByRole('button', { name: 'Open', exact: true, includeHidden: true });
}

/** Drags with the mouse from the center of `target` by `dy` pixels in small steps. */
async function drag(page: Page, target: Locator, dy: number) {
	const box = (await target.boundingBox())!;
	const x = box.x + box.width / 2;
	const y = box.y + Math.min(box.height / 2, 20);
	await page.mouse.move(x, y);
	await page.mouse.down();
	await page.mouse.move(x, y + dy, { steps: 12 });
	await page.mouse.up();
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('click opens a dialog labelled by its title and description', async ({ page }) => {
			const { errors } = await openDrawer(page, 'standalone', reference);
			const opener = openButton(page);
			await expect(opener).toHaveAttribute('aria-haspopup', 'dialog');
			await expect(opener).toHaveAttribute('aria-expanded', 'false');
			await opener.click();

			const popup = page.getByRole('dialog');
			await expect(popup).toHaveAttribute('data-open', '');
			await expect(popup).toHaveAttribute('data-swipe-direction', 'down');
			await expect(popup).toHaveAccessibleName('Title');
			await expect(popup).toHaveAccessibleDescription('Description');
			await expect(opener).toHaveAttribute('aria-expanded', 'true');
			await expect(opener).toHaveAttribute('aria-controls', (await popup.getAttribute('id'))!);
			expect(errors).toEqual([]);
		});

		test('Escape closes it and focus returns to the trigger', async ({ page }) => {
			await openDrawer(page, 'standalone', reference);
			const opener = openButton(page);
			await opener.click();
			await expect(page.getByRole('dialog')).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(page.getByRole('dialog')).toHaveCount(0);
			await expect(opener).toBeFocused();
			expect(await readOpenCalls(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false },
				{ open: false, reason: 'escape-key', canceled: false }
			]);
		});

		test('a click on the backdrop closes it with outside-press', async ({ page }) => {
			await openDrawer(page, 'standalone', reference);
			await openButton(page).click();
			await expect(page.getByRole('dialog')).toBeVisible();
			await page.mouse.click(5, 5);
			await expect(page.getByRole('dialog')).toHaveCount(0);
			expect((await readOpenCalls(page)).at(-1)).toEqual({
				open: false,
				reason: 'outside-press',
				canceled: false
			});
		});

		test('swiping the popup down dismisses it', async ({ page }) => {
			await openDrawer(page, 'standalone', reference);
			await openButton(page).click();
			const popup = page.getByTestId('popup');
			await expect(popup).toHaveAttribute('data-open', '');
			await drag(page, popup, 300);
			await expect(page.getByRole('dialog')).toHaveCount(0);
			expect((await readOpenCalls(page)).at(-1)).toEqual({
				open: false,
				reason: 'swipe',
				canceled: false
			});
		});

		test('a short swipe springs back and keeps it open', async ({ page }) => {
			await openDrawer(page, 'standalone', reference);
			await openButton(page).click();
			const popup = page.getByTestId('popup');
			await expect(popup).toHaveAttribute('data-open', '');
			await drag(page, popup, 20);
			await expect(popup).not.toHaveAttribute('data-swiping');
			await expect(popup).toHaveAttribute('data-open', '');
			expect(await readOpenCalls(page)).toHaveLength(1);
		});

		test('swiping up moves to the next snap point', async ({ page }) => {
			await openDrawer(page, 'snap', reference);
			await openButton(page).click();
			const popup = page.getByTestId('popup');
			await expect(popup).toHaveAttribute('data-open', '');
			await expect(popup).not.toHaveAttribute('data-expanded');
			await expect
				.poll(() => popup.evaluate((el) => el.style.getPropertyValue('--drawer-snap-point-offset')))
				.toBe('240px');

			await drag(page, popup, -200);

			await expect(popup).toHaveAttribute('data-expanded', '');
			expect(await readOutput(page, 'snap-point')).toBe(1);
			await expect
				.poll(() => popup.evaluate((el) => el.style.getPropertyValue('--drawer-snap-point-offset')))
				.toBe('0px');
		});

		test('swiping up from the swipe area opens it', async ({ page }) => {
			await openDrawer(page, 'swipe-area', reference);
			const area = page.getByTestId('swipe-area');
			await expect(area).toHaveAttribute('data-closed', '');
			await expect(area).toHaveAttribute('data-swipe-direction', 'up');
			await drag(page, area, -300);
			await expect(page.getByRole('dialog')).toHaveAttribute('data-open', '');
			await expect(area).toHaveAttribute('data-open', '');
			expect(await readOpenCalls(page)).toEqual([{ open: true, reason: 'swipe', canceled: false }]);
		});

		test('the provider marks the indent parts active while a drawer is open', async ({ page }) => {
			await openDrawer(page, 'provider', reference);
			const indent = page.getByTestId('indent');
			const background = page.getByTestId('indent-background');
			await expect(indent).toHaveAttribute('data-inactive', '');
			await expect(background).toHaveAttribute('data-inactive', '');
			await openButton(page).click();
			await expect(indent).toHaveAttribute('data-active', '');
			await expect(background).toHaveAttribute('data-active', '');
			await page.keyboard.press('Escape');
			await expect(indent).toHaveAttribute('data-inactive', '');
			await expect(background).toHaveAttribute('data-inactive', '');
		});

		test('a nested drawer marks its parent and closes alone on Escape', async ({ page }) => {
			await openDrawer(page, 'nested', reference);
			await openButton(page).click();
			const parent = page.getByTestId('popup');
			await expect(parent).toHaveAttribute('data-open', '');
			await page.getByRole('button', { name: 'Open nested' }).click();

			const nested = page.getByTestId('nested-popup');
			await expect(nested).toHaveAttribute('data-open', '');
			await expect(nested).toHaveAttribute('data-nested', '');
			await expect(parent).toHaveAttribute('data-nested-drawer-open', '');
			await expect
				.poll(() => parent.evaluate((el) => el.style.getPropertyValue('--nested-drawers')))
				.toBe('1');

			await page.keyboard.press('Escape');
			await expect(nested).toHaveCount(0);
			await expect(parent).toHaveAttribute('data-open', '');
			await expect(parent).not.toHaveAttribute('data-nested-drawer-open');
		});
	});
}
