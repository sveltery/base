// Each case runs against the Svelte Menubar and the React Base UI 1.9.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { forEachFramework } from '../framework-loop.js';
import { openFixture } from '../open-fixture.js';
import { readOutput as json } from '../read-output.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const { errors } = await openFixture(page, 'menubar', scenario, reference);
	return {
		bar: page.getByRole('menubar'),
		trigger: (name: string) => page.getByRole('menubar').getByRole('menuitem', { name }),
		menu: (name: string) => page.getByRole('menu', { name: `${name} menu` }),
		item: (name: string) => page.getByRole('menu').getByRole('menuitem', { name }),
		errors
	};
}

async function hover(page: Page, target: ReturnType<Page['getByRole']>) {
	const box = await target.boundingBox();
	if (!box) throw new Error('target is not rendered');
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
}

forEachFramework((reference, framework) => {
	test.describe(framework, () => {
		test('renders a menubar of menu item triggers with one tab stop', async ({ page }) => {
			const { bar, trigger, errors } = await open(page, 'basic', reference);
			await expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
			await expect(bar).toHaveAttribute('data-orientation', 'horizontal');
			await expect(bar).toHaveAttribute('data-modal', '');
			await expect(bar).not.toHaveAttribute('data-has-submenu-open');
			await expect(bar.getByRole('menuitem')).toHaveText(['File', 'Edit', 'View']);
			await expect(trigger('File')).toHaveAttribute('aria-haspopup', 'menu');
			await expect(trigger('File')).toHaveAttribute('tabindex', '0');
			await expect(trigger('Edit')).toHaveAttribute('tabindex', '-1');
			await expect(trigger('View')).toHaveAttribute('tabindex', '-1');

			await page.getByRole('button', { name: 'Outside' }).focus();
			await page.keyboard.press('Tab');
			await expect(trigger('File')).toBeFocused();
			expect(errors).toEqual([]);
		});

		test('arrow keys, Home and End move between triggers without opening menus', async ({
			page
		}) => {
			const { trigger } = await open(page, 'basic', reference);
			await trigger('File').focus();
			await page.keyboard.press('ArrowRight');
			await expect(trigger('Edit')).toBeFocused();
			await expect(trigger('Edit')).toHaveAttribute('tabindex', '0');
			await expect(trigger('File')).toHaveAttribute('tabindex', '-1');
			await page.keyboard.press('ArrowRight');
			await expect(trigger('View')).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(trigger('File')).toBeFocused();
			await page.keyboard.press('ArrowLeft');
			await expect(trigger('View')).toBeFocused();
			await page.keyboard.press('Home');
			await expect(trigger('File')).toBeFocused();
			await page.keyboard.press('End');
			await expect(trigger('View')).toBeFocused();
			await expect(page.getByRole('menu')).toHaveCount(0);
			expect(await json(page, 'calls')).toEqual([]);
		});

		test('ArrowDown opens a menu and ArrowRight moves to the next one', async ({ page }) => {
			const { bar, trigger, menu, item } = await open(page, 'basic', reference);
			await trigger('File').focus();
			await page.keyboard.press('ArrowDown');
			await expect(menu('File')).toBeVisible();
			await expect(item('New')).toBeFocused();
			await expect(bar).toHaveAttribute('data-has-submenu-open', '');
			await expect(trigger('File')).toHaveAttribute('aria-expanded', 'true');

			await page.keyboard.press('ArrowRight');
			await expect(menu('Edit')).toBeVisible();
			await expect(menu('File')).toHaveCount(0);
			await expect(trigger('Edit')).toHaveAttribute('aria-expanded', 'true');
			await expect(bar).toHaveAttribute('data-has-submenu-open', '');

			await page.keyboard.press('Escape');
			await expect(page.getByRole('menu')).toHaveCount(0);
			await expect(trigger('Edit')).toBeFocused();
			await expect(bar).not.toHaveAttribute('data-has-submenu-open');
			expect(await json(page, 'calls')).toEqual([
				{ menu: 'File', open: true, reason: 'list-navigation' },
				{ menu: 'Edit', open: true, reason: 'trigger-focus' },
				{ menu: 'File', open: false, reason: 'sibling-open' },
				{ menu: 'Edit', open: false, reason: 'escape-key' }
			]);
		});

		test('Enter opens a menu and activates an item', async ({ page }) => {
			const { trigger, menu, item } = await open(page, 'basic', reference);
			await trigger('Edit').focus();
			await page.keyboard.press('Enter');
			await expect(menu('Edit')).toBeVisible();
			await expect(item('Copy')).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await expect(item('Paste')).toBeFocused();
			await page.keyboard.press('Enter');
			await expect(page.getByRole('menu')).toHaveCount(0);
			await expect(trigger('Edit')).toBeFocused();
			await page.waitForTimeout(150);
			await expect(page.getByRole('menu')).toHaveCount(0);
			expect(await json(page, 'clicks')).toEqual(['Paste']);
			expect(await json(page, 'calls')).toEqual([
				{ menu: 'Edit', open: true, reason: 'trigger-press' },
				{ menu: 'Edit', open: false, reason: 'item-press' }
			]);
		});

		test('Space opens a menu on keydown', async ({ page }) => {
			const { trigger, menu } = await open(page, 'basic', reference);
			await trigger('File').focus();
			await page.keyboard.down(' ');
			await expect(menu('File')).toBeVisible();
			await page.keyboard.up(' ');
			await page.waitForTimeout(100);
			await expect(menu('File')).toBeVisible();
			expect(await json(page, 'calls')).toEqual([
				{ menu: 'File', open: true, reason: 'trigger-press' }
			]);
		});

		test('hovering another trigger switches menus once one is open', async ({ page }) => {
			const { bar, trigger, menu } = await open(page, 'basic', reference);
			await hover(page, trigger('Edit'));
			await page.waitForTimeout(150);
			await expect(page.getByRole('menu')).toHaveCount(0);

			await trigger('File').click();
			await expect(menu('File')).toBeVisible();
			await hover(page, trigger('Edit'));
			await expect(menu('Edit')).toBeVisible();
			await expect(menu('File')).toHaveCount(0);
			await hover(page, trigger('View'));
			await expect(menu('View')).toBeVisible();
			await expect(menu('Edit')).toHaveCount(0);
			await expect(bar).toHaveAttribute('data-has-submenu-open', '');

			await page.mouse.click(5, 400);
			await expect(page.getByRole('menu')).toHaveCount(0);
			await expect(bar).not.toHaveAttribute('data-has-submenu-open');
		});

		test('clicking the open trigger closes its menu', async ({ page }) => {
			const { trigger, menu } = await open(page, 'basic', reference);
			await trigger('File').click();
			await expect(menu('File')).toBeVisible();
			await trigger('File').click();
			await expect(page.getByRole('menu')).toHaveCount(0);
			expect(await json(page, 'calls')).toEqual([
				{ menu: 'File', open: true, reason: 'trigger-press' },
				{ menu: 'File', open: false, reason: 'trigger-press' }
			]);
		});

		test('loopFocus false stops at the ends', async ({ page }) => {
			const { trigger } = await open(page, 'no-loop', reference);
			await trigger('File').focus();
			await page.keyboard.press('ArrowLeft');
			await expect(trigger('File')).toBeFocused();
			await page.keyboard.press('End');
			await expect(trigger('View')).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(trigger('View')).toBeFocused();
		});

		test('a vertical menubar moves with ArrowDown and opens with ArrowRight', async ({ page }) => {
			const { bar, trigger, menu, item } = await open(page, 'vertical', reference);
			await expect(bar).toHaveAttribute('aria-orientation', 'vertical');
			await expect(bar).toHaveAttribute('data-orientation', 'vertical');
			await trigger('File').focus();
			await page.keyboard.press('ArrowDown');
			await expect(trigger('Edit')).toBeFocused();
			await expect(page.getByRole('menu')).toHaveCount(0);

			await page.keyboard.press('ArrowRight');
			await expect(menu('Edit')).toBeVisible();
			await expect(item('Copy')).toBeFocused();
		});

		test('a disabled menubar disables every trigger', async ({ page }) => {
			const { trigger } = await open(page, 'disabled', reference);
			await expect(trigger('File')).toBeDisabled();
			await expect(trigger('Edit')).toBeDisabled();
			await trigger('File').click({ force: true });
			await page.waitForTimeout(100);
			await expect(page.getByRole('menu')).toHaveCount(0);
			expect(await json(page, 'calls')).toEqual([]);
		});

		test('arrow keys skip a disabled trigger', async ({ page }) => {
			const { trigger } = await open(page, 'disabled-trigger', reference);
			await expect(trigger('Edit')).toBeDisabled();
			await expect(trigger('Edit')).toHaveAttribute('aria-disabled', 'true');
			await expect(trigger('File')).toHaveAttribute('aria-disabled', 'false');
			await trigger('File').focus();
			await page.keyboard.press('ArrowRight');
			await expect(trigger('View')).toBeFocused();
			await page.keyboard.press('ArrowLeft');
			await expect(trigger('File')).toBeFocused();
		});

		test('server HTML renders the menubar and its triggers', async ({ request }) => {
			test.skip(reference, 'the React reference renders on the client only');
			const html = await (await request.get('/fixtures/menubar?case=basic')).text();
			expect(html).toMatch(/role="menubar"[^>]*aria-orientation="horizontal"/);
			expect(html).toContain('data-modal=""');
			expect(html.match(/role="menuitem"/g)?.length).toBe(3);
		});
	});
});
