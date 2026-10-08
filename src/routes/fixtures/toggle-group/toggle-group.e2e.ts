// Each case runs against the Svelte ToggleGroup and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { forEachFramework } from '../framework-loop.js';
import { openFixture } from '../open-fixture.js';
import { focusArrowLoop } from '../arrow-loop.js';
import { readValueCalls } from '../read-output.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'toggle-group', scenario, reference);
}

forEachFramework((reference, framework) => {
	test.describe(framework, () => {
		test('click selects one toggle and releases the other', async ({ page }) => {
			const { errors } = await open(page, 'exclusive', reference);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });
			const group = page.getByRole('group', { name: 'Formatting' });

			await expect(group).toHaveAttribute('data-orientation', 'horizontal');
			await expect(group).not.toHaveAttribute('aria-orientation');
			await expect(one).toHaveAttribute('aria-pressed', 'false');
			await expect(one).toHaveAttribute('tabindex', '0');
			await expect(two).toHaveAttribute('tabindex', '-1');

			await one.click();
			await expect(one).toHaveAttribute('aria-pressed', 'true');
			await expect(one).toHaveAttribute('data-pressed', '');
			await expect(two).toHaveAttribute('aria-pressed', 'false');
			expect(await readValueCalls<string[]>(page)).toEqual([
				{ value: ['one'], reason: 'none', canceled: false }
			]);

			await two.click();
			await expect(one).toHaveAttribute('aria-pressed', 'false');
			await expect(two).toHaveAttribute('aria-pressed', 'true');
			expect(errors).toEqual([]);
		});

		test('multiple keeps each pressed toggle', async ({ page }) => {
			await open(page, 'multiple', reference);
			const group = page.getByRole('group', { name: 'Formatting' });
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });

			await expect(group).toHaveAttribute('data-multiple', '');
			await one.click();
			await two.click();
			await expect(one).toHaveAttribute('aria-pressed', 'true');
			await expect(two).toHaveAttribute('aria-pressed', 'true');
		});

		test('vertical arrows move focus and the other axis does not', async ({ page }) => {
			await open(page, 'vertical', reference);
			const group = page.getByRole('group', { name: 'Formatting' });
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });

			await expect(group).toHaveAttribute('data-orientation', 'vertical');
			await expect(group).not.toHaveAttribute('aria-orientation');
			await one.focus();
			await page.keyboard.press('ArrowDown');
			await expect(two).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(two).toBeFocused();
		});

		test('rtl horizontal arrows are mirrored', async ({ page }) => {
			await open(page, 'rtl', reference);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });
			await one.focus();
			await page.keyboard.press('ArrowLeft');
			await expect(two).toBeFocused();
			await expect(two).toHaveAttribute('tabindex', '0');
			await page.keyboard.press('ArrowRight');
			await expect(one).toBeFocused();
		});

		test('arrows loop, Home and End jump, and Space presses', async ({ page }) => {
			await open(page, 'keyboard', reference);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });
			const three = page.getByRole('button', { name: 'Three' });

			await expect(one).toHaveAttribute('tabindex', '0');
			await focusArrowLoop(page, one, two, three);
			await page.keyboard.press('End');
			await expect(three).toBeFocused();
			await expect(three).toHaveAttribute('tabindex', '0');
			await page.keyboard.press('Home');
			await expect(one).toBeFocused();
			await page.keyboard.press('Space');
			await expect(one).toHaveAttribute('aria-pressed', 'true');
		});

		test('disabled group does not press', async ({ page }) => {
			await open(page, 'disabled', reference);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });
			await expect(one).toBeDisabled();
			await expect(one).toHaveAttribute('aria-disabled', 'true');
			await expect(one).toHaveAttribute('data-disabled', '');
			await expect(two).toHaveAttribute('aria-disabled', 'true');
			await one.click({ force: true });
			await expect(one).toHaveAttribute('aria-pressed', 'false');
			expect(await readValueCalls<string[]>(page)).toEqual([]);
		});

		test('canceling onValueChange keeps every toggle released', async ({ page }) => {
			await open(page, 'cancel', reference);
			const one = page.getByRole('button', { name: 'One' });
			await one.click();
			await expect(one).toHaveAttribute('aria-pressed', 'false');
			expect(await readValueCalls<string[]>(page)).toEqual([
				{ value: ['one'], reason: 'none', canceled: true }
			]);
		});

		test('owner value selects a toggle and a click updates the owner', async ({ page }) => {
			await open(page, 'bound', reference);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });
			const owner = page.getByRole('checkbox', { name: 'Owner two' });

			await expect(two).toHaveAttribute('aria-pressed', 'false');
			await owner.click();
			await expect(two).toHaveAttribute('aria-pressed', 'true');
			await expect(one).toHaveAttribute('aria-pressed', 'false');

			await one.click();
			await expect(one).toHaveAttribute('aria-pressed', 'true');
			await expect(two).toHaveAttribute('aria-pressed', 'false');
			await expect(owner).not.toBeChecked();
			expect(await readValueCalls<string[]>(page)).toEqual([
				{ value: ['one'], reason: 'none', canceled: false }
			]);
		});
	});
});

test('svelte SSR renders the group tab stop before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/toggle-group?case=exclusive')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="group"');
	expect(html).toContain('data-orientation="horizontal"');
	expect(html).toContain('tabindex="0"');
	expect(html).toContain('tabindex="-1"');
	expect(html).toContain('aria-pressed="false"');
	expect(html).not.toContain('aria-orientation');
});
