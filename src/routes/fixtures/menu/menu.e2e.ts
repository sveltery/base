// Each case runs against the Svelte Menu and the React Base UI 1.9.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { forEachFramework } from '../framework-loop.js';
import { openFixture } from '../open-fixture.js';
import { readOutput as json } from '../read-output.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const { errors } = await openFixture(page, 'menu', scenario, reference);
	return {
		trigger: page.getByRole('button', { name: 'Open' }),
		menu: page.getByRole('menu'),
		item: (name: string) => page.getByRole('menuitem', { name }),
		errors
	};
}

// Moves the real pointer in steps, so the safe polygon sees the path.
async function moveTo(page: Page, target: ReturnType<Page['getByRole']>) {
	const box = await target.boundingBox();
	if (!box) throw new Error('target is not rendered');
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 });
}

forEachFramework((reference, framework) => {
	test.describe(framework, () => {
		test('click opens the menu and escape returns focus to the trigger', async ({ page }) => {
			const { trigger, menu, errors } = await open(page, 'basic', reference);
			await expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');

			await trigger.click();
			await expect(menu).toBeVisible();
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect(trigger).toHaveAttribute('data-popup-open', '');
			await expect(menu.getByRole('menuitem')).toHaveText(['Apple', 'Banana', 'Cherry']);

			await page.keyboard.press('Escape');
			await expect(menu).toHaveCount(0);
			await expect(trigger).toBeFocused();
			expect(await json(page, 'calls')).toEqual([
				{ open: true, reason: 'trigger-press' },
				{ open: false, reason: 'escape-key' }
			]);
			expect(errors).toEqual([]);
		});

		test('arrow keys open the menu and move the highlight', async ({ page }) => {
			const { trigger, menu, item } = await open(page, 'basic', reference);
			await trigger.focus();
			await page.keyboard.press('ArrowDown');
			await expect(menu).toBeVisible();
			await expect(item('Apple')).toBeFocused();
			await expect(item('Apple')).toHaveAttribute('data-highlighted', '');

			await page.keyboard.press('ArrowDown');
			await expect(item('Banana')).toBeFocused();
			await expect(item('Apple')).not.toHaveAttribute('data-highlighted');
			await page.keyboard.press('ArrowDown');
			await expect(item('Cherry')).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await expect(item('Apple')).toBeFocused();
			await page.keyboard.press('ArrowUp');
			await expect(item('Cherry')).toBeFocused();
			await page.keyboard.press('End');
			await expect(item('Cherry')).toBeFocused();
			await page.keyboard.press('Home');
			await expect(item('Apple')).toBeFocused();
		});

		test('Enter on the trigger opens the menu with the first item highlighted', async ({
			page
		}) => {
			const { trigger, menu, item } = await open(page, 'basic', reference);
			await trigger.focus();
			await page.keyboard.press('Enter');
			await expect(menu).toBeVisible();
			await expect(item('Apple')).toBeFocused();
		});

		test('typing a letter highlights the matching item', async ({ page }) => {
			const { trigger, item } = await open(page, 'basic', reference);
			await trigger.focus();
			await page.keyboard.press('ArrowDown');
			await expect(item('Apple')).toBeFocused();
			await page.keyboard.type('c');
			await expect(item('Cherry')).toBeFocused();
			await page.waitForTimeout(600);
			await page.keyboard.type('b');
			await expect(item('Banana')).toBeFocused();
		});

		test('onItemHighlighted reports keyboard and pointer highlights', async ({ page }) => {
			const { trigger, menu, item } = await open(page, 'basic', reference);
			await trigger.focus();
			await page.keyboard.press('ArrowDown');
			await expect(item('Apple')).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await expect(item('Banana')).toBeFocused();
			await moveTo(page, item('Cherry'));
			await expect(item('Cherry')).toBeFocused();
			await page.keyboard.press('Escape');
			await expect(menu).toHaveCount(0);
			expect(await json(page, 'highlights')).toEqual([
				{ item: 'Apple', reason: 'none', label: 'Apple' },
				{ item: 'Banana', reason: 'keyboard', label: 'Banana' },
				{ item: 'Cherry', reason: 'pointer', label: 'Cherry' },
				{ item: null, reason: 'none', label: null }
			]);
		});

		test('clicking an item runs its handler and closes the menu', async ({ page }) => {
			const { trigger, menu, item } = await open(page, 'basic', reference);
			await trigger.click();
			await item('Banana').click();
			await expect(menu).toHaveCount(0);
			expect(await json(page, 'clicks')).toEqual(['Banana']);
			expect(await json(page, 'calls')).toEqual([
				{ open: true, reason: 'trigger-press' },
				{ open: false, reason: 'item-press' }
			]);
		});

		test('Enter activates the highlighted item', async ({ page }) => {
			const { trigger, menu, item } = await open(page, 'basic', reference);
			await trigger.focus();
			await page.keyboard.press('ArrowDown');
			// Focus reaches the first item a frame after opening. An arrow key that lands on the trigger
			// before then restarts from the first item, in React too.
			await expect(item('Apple')).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await expect(item('Banana')).toBeFocused();
			await page.keyboard.press('Enter');
			await expect(menu).toHaveCount(0);
			expect(await json(page, 'clicks')).toEqual(['Banana']);
			await expect(trigger).toBeFocused();
		});

		test('an outside click closes the menu', async ({ page }) => {
			const { trigger, menu } = await open(page, 'basic', reference);
			await trigger.click();
			await expect(menu).toBeVisible();
			await page.mouse.click(5, 400);
			await expect(menu).toHaveCount(0);
			expect((await json<{ reason: string }[]>(page, 'calls')).at(-1)?.reason).toBe(
				'outside-press'
			);
		});

		test('arrow keys open and close a submenu', async ({ page }) => {
			const { trigger, menu, item } = await open(page, 'submenu', reference);
			await trigger.focus();
			await page.keyboard.press('ArrowDown');
			await expect(item('Apple')).toBeFocused();
			await page.keyboard.press('ArrowDown');
			const more = item('More');
			await expect(more).toBeFocused();
			await expect(more).toHaveAttribute('aria-haspopup', 'menu');
			await expect(more).toHaveAttribute('aria-expanded', 'false');

			await page.keyboard.press('ArrowRight');
			await expect(menu).toHaveCount(2);
			await expect(item('Delta')).toBeFocused();
			await expect(more).toHaveAttribute('aria-expanded', 'true');
			await expect(more).toHaveAttribute('data-popup-open', '');
			await page.keyboard.press('ArrowDown');
			await expect(item('Echo')).toBeFocused();

			await page.keyboard.press('ArrowLeft');
			await expect(menu).toHaveCount(1);
			await expect(more).toBeFocused();

			await page.keyboard.press('Enter');
			await expect(item('Delta')).toBeFocused();
			await page.keyboard.press('Escape');
			await expect(menu).toHaveCount(1);
			await expect(more).toBeFocused();
		});

		test('hover opens a submenu and hovering a sibling closes it', async ({ page }) => {
			const { trigger, menu, item } = await open(page, 'submenu', reference);
			await trigger.click();
			await item('More').hover();
			await expect(menu).toHaveCount(2);
			await expect(item('Delta')).toBeVisible();
			await moveTo(page, item('Cherry'));
			await expect(menu).toHaveCount(1);
			expect(await json(page, 'subcalls')).toEqual([
				{ open: true, reason: 'trigger-hover' },
				{ open: false, reason: 'trigger-hover' }
			]);
		});

		test('a submenu closeDelay keeps it open while a sibling is hovered', async ({ page }) => {
			const { trigger, menu, item } = await open(page, 'delay', reference);
			await trigger.click();
			await item('More').hover();
			await expect(item('Delta')).toBeVisible();
			await moveTo(page, item('Apple'));
			await expect(item('Apple')).toBeFocused();
			await page.waitForTimeout(150);
			await expect(menu).toHaveCount(2);
			await expect(menu).toHaveCount(1);
			expect(await json(page, 'subcalls')).toEqual([
				{ open: true, reason: 'trigger-hover' },
				{ open: false, reason: 'trigger-hover' }
			]);
		});

		test('clicking a submenu item closes every menu', async ({ page }) => {
			const { trigger, menu, item } = await open(page, 'submenu', reference);
			await trigger.click();
			await item('More').hover();
			await moveTo(page, item('Delta'));
			await item('Delta').click();
			await expect(menu).toHaveCount(0);
			expect(await json(page, 'clicks')).toEqual(['Delta']);
		});

		test('checkbox and radio items toggle and keep the menu open', async ({ page }) => {
			const { trigger, menu } = await open(page, 'choices', reference);
			await trigger.click();
			const boldItem = page.getByRole('menuitemcheckbox', { name: 'Bold' });
			const small = page.getByRole('menuitemradio', { name: 'Small' });
			const large = page.getByRole('menuitemradio', { name: 'Large' });
			await expect(boldItem).toHaveAttribute('aria-checked', 'false');
			await expect(boldItem).toHaveAttribute('data-unchecked', '');
			await expect(page.getByTestId('bold-indicator')).toHaveCount(0);
			await expect(small).toHaveAttribute('aria-checked', 'true');
			await expect(page.getByRole('group')).toHaveAccessibleName('Size');

			await boldItem.click();
			await expect(menu).toBeVisible();
			await expect(boldItem).toHaveAttribute('aria-checked', 'true');
			await expect(boldItem).toHaveAttribute('data-checked', '');
			await expect(page.getByTestId('bold-indicator')).toHaveAttribute('data-checked', '');

			await large.click();
			await expect(menu).toBeVisible();
			await expect(large).toHaveAttribute('aria-checked', 'true');
			await expect(small).toHaveAttribute('aria-checked', 'false');
			await expect(page.getByTestId('small-indicator')).toHaveCount(0);
			expect(await json(page, 'choices')).toEqual({ bold: true, size: 'large' });

			await boldItem.focus();
			await page.keyboard.press(' ');
			await expect(boldItem).toHaveAttribute('aria-checked', 'false');
			expect(await json(page, 'choices')).toEqual({ bold: false, size: 'large' });
		});

		test('typing filters the items and Enter activates the highlighted match', async ({ page }) => {
			const { trigger, item, errors } = await open(page, 'filter', reference);
			const input = page.getByRole('searchbox', { name: 'Filter fruits' });
			await trigger.click();
			await expect(input).toBeFocused();
			await expect(page.getByRole('dialog')).toBeVisible();
			await expect(page.getByRole('menuitem')).toHaveText(['Apple', 'Banana', 'Lemon', 'Lime']);

			await page.keyboard.type('l');
			await expect(page.getByRole('menuitem')).toHaveText(['Apple', 'Lemon', 'Lime']);
			await expect(page.getByText('Citrus')).toBeVisible();
			await page.keyboard.press('Backspace');
			await page.keyboard.type('ban');
			await expect(page.getByRole('menuitem')).toHaveText(['Banana']);
			await expect(page.getByText('Citrus')).toBeHidden();

			await page.keyboard.press('ArrowDown');
			await expect(input).toBeFocused();
			await expect(item('Banana')).toHaveAttribute('data-highlighted', '');
			const id = await item('Banana').getAttribute('id');
			await expect(input).toHaveAttribute('aria-activedescendant', id!);

			await page.keyboard.press('Enter');
			await expect(input).toHaveCount(0);
			await expect(trigger).toBeFocused();
			expect(await json(page, 'clicks')).toEqual(['Banana']);
			expect(await json(page, 'queries')).toEqual([
				{ value: 'l', reason: 'input-change' },
				{ value: '', reason: 'input-clear' },
				{ value: 'b', reason: 'input-change' },
				{ value: 'ba', reason: 'input-change' },
				{ value: 'ban', reason: 'input-change' },
				{ value: '', reason: 'popup-close' }
			]);
			expect(errors).toEqual([]);
		});

		test('a query with no match shows the empty state until Clear resets it', async ({ page }) => {
			const { trigger } = await open(page, 'filter', reference);
			const input = page.getByRole('searchbox', { name: 'Filter fruits' });
			await trigger.click();
			await expect(input).toBeFocused();
			await page.keyboard.type('zz');
			await expect(page.getByRole('menuitem')).toHaveCount(0);
			await expect(page.getByText('No fruits')).toBeVisible();

			await page.locator('[aria-label="Clear filter"]').click();
			await expect(input).toHaveValue('');
			await expect(input).toBeFocused();
			await expect(page.getByRole('menuitem')).toHaveText(['Apple', 'Banana', 'Lemon', 'Lime']);
			await expect(page.getByText('No fruits')).toHaveCount(0);
			expect(await json(page, 'queries')).toEqual([
				{ value: 'z', reason: 'input-change' },
				{ value: 'zz', reason: 'input-change' },
				{ value: '', reason: 'clear-press' }
			]);
		});

		test('hover on an openOnHover trigger opens the menu', async ({ page }) => {
			const { trigger, menu } = await open(page, 'hover', reference);
			await trigger.hover();
			await expect(menu).toBeVisible();
			expect(await json(page, 'calls')).toEqual([{ open: true, reason: 'trigger-hover' }]);
			await page.mouse.move(5, 400);
			await expect(menu).toHaveCount(0);
		});
	});
});
