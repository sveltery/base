// Each case runs against the Svelte ContextMenu and the React Base UI 1.9.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { forEachFramework } from '../framework-loop.js';
import { openFixture } from '../open-fixture.js';
import { readOutput as json } from '../read-output.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const { errors } = await openFixture(page, 'context-menu', scenario, reference);
	const area = page.getByTestId('area');
	const box = await area.boundingBox();
	if (!box) throw new Error('area is not rendered');
	return {
		area,
		/** A point inside the area, offset from its top-left corner. */
		at: (dx: number, dy: number) => ({ x: Math.round(box.x + dx), y: Math.round(box.y + dy) }),
		menu: page.getByRole('menu', { name: 'Actions' }),
		item: (name: string) => page.getByRole('menuitem', { name }),
		errors
	};
}

async function rightClick(page: Page, point: { x: number; y: number }) {
	await page.mouse.click(point.x, point.y, { button: 'right' });
}

async function corner(page: Page) {
	const box = await page.getByTestId('positioner').boundingBox();
	if (!box) throw new Error('positioner is not rendered');
	return [Math.round(box.x), Math.round(box.y)];
}

forEachFramework((reference, framework) => {
	test.describe(framework, () => {
		test('right click opens the menu at the pointer and Escape closes it', async ({ page }) => {
			const { area, at, menu, errors } = await open(page, 'basic', reference);
			const point = at(40, 50);
			await rightClick(page, point);
			await expect(menu).toBeVisible();
			await expect(menu).toBeFocused();
			await expect(area).toHaveAttribute('data-popup-open', '');
			await expect(area).toHaveAttribute('data-pressed', '');
			await expect(menu.getByRole('menuitem')).toHaveText(['Copy', 'Paste', 'Rename', 'Delete']);
			await expect.poll(() => corner(page)).toEqual([point.x + 2, point.y - 5]);

			await page.keyboard.press('Escape');
			await expect(menu).toHaveCount(0);
			await expect(area).not.toHaveAttribute('data-popup-open');
			expect(await json(page, 'calls')).toEqual([
				{ open: true, reason: 'trigger-press' },
				{ open: false, reason: 'escape-key' }
			]);
			expect(errors).toEqual([]);
		});

		test('arrow keys move through the items and Enter activates one', async ({ page }) => {
			const { at, menu, item } = await open(page, 'basic', reference);
			await rightClick(page, at(40, 50));
			await expect(menu).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await expect(item('Copy')).toBeFocused();
			await expect(item('Copy')).toHaveAttribute('data-highlighted', '');
			await page.keyboard.press('ArrowDown');
			await expect(item('Paste')).toBeFocused();
			await page.keyboard.press('ArrowUp');
			await expect(item('Copy')).toBeFocused();
			await page.keyboard.press('End');
			await expect(item('Delete')).toBeFocused();
			await expect(item('Delete')).toHaveAttribute('aria-disabled', 'true');
			await page.keyboard.press('Home');
			await expect(item('Copy')).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await page.keyboard.press('Enter');
			await expect(menu).toHaveCount(0);
			expect(await json(page, 'clicks')).toEqual(['Paste']);
			expect(await json(page, 'calls')).toEqual([
				{ open: true, reason: 'trigger-press' },
				{ open: false, reason: 'item-press' }
			]);
		});

		test('clicking an item runs it and closes the menu', async ({ page }) => {
			const { at, menu, item } = await open(page, 'basic', reference);
			await rightClick(page, at(40, 50));
			await expect(menu).toBeVisible();
			await item('Rename').click();
			await expect(menu).toHaveCount(0);
			expect(await json(page, 'clicks')).toEqual(['Rename']);
			expect(await json(page, 'calls')).toEqual([
				{ open: true, reason: 'trigger-press' },
				{ open: false, reason: 'item-press' }
			]);
		});

		test('a disabled item does not run or close the menu', async ({ page }) => {
			const { at, menu, item } = await open(page, 'basic', reference);
			await rightClick(page, at(40, 50));
			await item('Delete').click({ force: true });
			await expect(menu).toBeVisible();
			expect(await json(page, 'clicks')).toEqual([]);
		});

		test('a click outside closes the menu', async ({ page }) => {
			const { at, menu } = await open(page, 'basic', reference);
			// The modal menu hides the rest of the page from the accessibility tree once open.
			const outside = await page.getByRole('button', { name: 'Outside' }).boundingBox();
			await rightClick(page, at(40, 50));
			await expect(menu).toBeVisible();
			await page.mouse.click(outside!.x + 5, outside!.y + 5);
			await expect(menu).toHaveCount(0);
			expect(await json(page, 'calls')).toEqual([
				{ open: true, reason: 'trigger-press' },
				{ open: false, reason: 'outside-press' }
			]);
		});

		test('a right click elsewhere in the area moves the open menu', async ({ page }) => {
			const { at, menu } = await open(page, 'basic', reference);
			const first = at(40, 50);
			await rightClick(page, first);
			await expect(menu).toBeVisible();
			await expect.poll(() => corner(page)).toEqual([first.x + 2, first.y - 5]);

			const second = at(200, 150);
			await rightClick(page, second);
			await expect(menu).toBeVisible();
			await expect.poll(() => corner(page)).toEqual([second.x + 2, second.y - 5]);
			// The right button press closes the menu as an outside press. The backdrop goes inert,
			// so the context menu event that follows reaches the trigger and reopens it.
			expect(await json(page, 'calls')).toEqual([
				{ open: true, reason: 'trigger-press' },
				{ open: false, reason: 'outside-press' },
				{ open: true, reason: 'trigger-press' }
			]);
		});

		test('a disabled context menu leaves the native menu alone', async ({ page }) => {
			const { area, at, menu } = await open(page, 'disabled', reference);
			await area.evaluate((element) => {
				const view = element.ownerDocument.defaultView as Window & { prevented?: boolean };
				view.addEventListener(
					'contextmenu',
					(event) => {
						view.prevented = event.defaultPrevented;
						event.preventDefault();
					},
					{ once: true }
				);
			});
			await rightClick(page, at(40, 50));
			await expect
				.poll(() => page.evaluate(() => (window as Window & { prevented?: boolean }).prevented))
				.toBe(false);
			await expect(menu).toHaveCount(0);
			expect(await json(page, 'calls')).toEqual([]);
		});
	});
});
