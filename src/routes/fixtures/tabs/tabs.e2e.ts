// Each case runs against the Svelte Tabs and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/tabs?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { errors };
}

async function calls(page: Page) {
	return JSON.parse(await page.getByTestId('calls').innerText()) as {
		value: unknown;
		reason: string;
		canceled: boolean;
	}[];
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('click selects a tab and shows its panel', async ({ page }) => {
			const { errors } = await open(page, 'select', reference);
			const one = page.getByRole('tab', { name: 'One' });
			const two = page.getByRole('tab', { name: 'Two' });
			const list = page.getByRole('tablist', { name: 'Sections' });

			await expect(list).toHaveAttribute('data-orientation', 'horizontal');
			await expect(list).not.toHaveAttribute('aria-orientation');
			await expect(one).toHaveAttribute('aria-selected', 'true');
			await expect(one).toHaveAttribute('tabindex', '0');
			await expect(two).toHaveAttribute('tabindex', '-1');
			await expect(page.getByRole('tabpanel')).toHaveText('One panel');

			await two.click();
			await expect(two).toHaveAttribute('aria-selected', 'true');
			await expect(two).toHaveAttribute('data-active', '');
			await expect(one).toHaveAttribute('aria-selected', 'false');
			await expect(page.getByRole('tabpanel')).toHaveText('Two panel');
			expect(await calls(page)).toEqual([
				{ value: 0, reason: 'initial', canceled: false },
				{ value: 1, reason: 'none', canceled: false }
			]);
			await expect(page.getByTestId('indicator')).not.toHaveAttribute('hidden');
			expect(errors).toEqual([]);
		});

		test('arrows move focus and Enter selects', async ({ page }) => {
			await open(page, 'keyboard', reference);
			const one = page.getByRole('tab', { name: 'One' });
			const two = page.getByRole('tab', { name: 'Two' });
			const three = page.getByRole('tab', { name: 'Three' });

			await one.focus();
			await page.keyboard.press('ArrowRight');
			await expect(two).toBeFocused();
			await expect(two).toHaveAttribute('aria-selected', 'false');
			await page.keyboard.press('End');
			await expect(three).toBeFocused();
			await page.keyboard.press('Home');
			await expect(one).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await page.keyboard.press('Enter');
			await expect(two).toHaveAttribute('aria-selected', 'true');
			await expect(page.getByRole('tabpanel')).toHaveText('Two panel');
		});

		test('activateOnFocus selects with the arrow key', async ({ page }) => {
			await open(page, 'follow', reference);
			await page.getByRole('tab', { name: 'One' }).focus();
			await page.keyboard.press('ArrowRight');
			await expect(page.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
			await expect(page.getByRole('tabpanel')).toHaveText('Two panel');
		});

		test('vertical arrows move focus down only', async ({ page }) => {
			await open(page, 'vertical', reference);
			const list = page.getByRole('tablist', { name: 'Sections' });
			const one = page.getByRole('tab', { name: 'One' });
			await expect(list).toHaveAttribute('aria-orientation', 'vertical');
			await one.focus();
			await page.keyboard.press('ArrowRight');
			await expect(one).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await expect(page.getByRole('tab', { name: 'Two' })).toBeFocused();
		});

		test('RTL ArrowLeft moves to the next tab', async ({ page }) => {
			await open(page, 'rtl', reference);
			await page.getByRole('tab', { name: 'One' }).focus();
			await page.keyboard.press('ArrowLeft');
			await expect(page.getByRole('tab', { name: 'Two' })).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(page.getByRole('tab', { name: 'One' })).toBeFocused();
		});

		test('a disabled tab is focusable and does not select', async ({ page }) => {
			await open(page, 'disabled', reference);
			const one = page.getByRole('tab', { name: 'One' });
			const two = page.getByRole('tab', { name: 'Two' });
			await expect(two).toHaveAttribute('aria-disabled', 'true');
			await expect(two).toHaveAttribute('data-disabled', '');
			await one.focus();
			await page.keyboard.press('ArrowRight');
			await expect(two).toBeFocused();
			await expect(one).toHaveAttribute('aria-selected', 'true');
			await two.click({ force: true });
			await expect(one).toHaveAttribute('aria-selected', 'true');
			expect(await calls(page)).toEqual([{ value: 0, reason: 'initial', canceled: false }]);
		});

		test('cancel keeps the previous tab selected', async ({ page }) => {
			await open(page, 'cancel', reference);
			await page.getByRole('tab', { name: 'Two' }).click();
			await expect(page.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
			expect(await calls(page)).toEqual([
				{ value: 0, reason: 'initial', canceled: false },
				{ value: 1, reason: 'none', canceled: true }
			]);
		});

		test('the owner and the tabs share one value', async ({ page }) => {
			await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner two' });
			const one = page.getByRole('tab', { name: 'One' });
			const two = page.getByRole('tab', { name: 'Two' });

			await expect(one).toHaveAttribute('aria-selected', 'true');
			expect(await calls(page)).toEqual([]);
			await owner.click();
			await expect(two).toHaveAttribute('aria-selected', 'true');
			await one.click();
			await expect(one).toHaveAttribute('aria-selected', 'true');
			await expect(owner).not.toBeChecked();
		});

		test('an omitted value skips a disabled first tab', async ({ page }) => {
			await open(page, 'fallback', reference);
			await expect(page.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
			await expect(page.getByRole('tab', { name: 'One' })).toHaveAttribute(
				'aria-selected',
				'false'
			);
			expect(await calls(page)).toEqual([{ value: 1, reason: 'initial', canceled: false }]);
		});

		test('loopFocus false stops on the first tab', async ({ page }) => {
			await open(page, 'loop', reference);
			const one = page.getByRole('tab', { name: 'One' });
			await one.focus();
			await page.keyboard.press('ArrowLeft');
			await expect(one).toBeFocused();
		});
	});
}

test('svelte SSR renders the selected tab before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/tabs?case=select')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="tablist"');
	expect(html).toContain('role="tab"');
	expect(html).toContain('aria-selected="true"');
	expect(html).toContain('aria-selected="false"');
	expect(html).toContain('tabindex="0"');
	expect(html).toContain('tabindex="-1"');
	expect(html).toContain('data-orientation="horizontal"');
	expect(html).toContain('data-activation-direction="none"');
	expect(html).toContain('One panel');
	expect(html).not.toContain('aria-orientation');
});
