// Each case runs against the Svelte DayPicker and the React react-day-picker 9.8.1 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const opened = await openFixture(page, 'day-picker', scenario, reference);
	return { selected: page.getByTestId('selected'), errors: opened.errors };
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('arrow keys, End and Page Down move focus through the grid and skip disabled days', async ({
			page
		}) => {
			const { selected, errors } = await open(page, 'single', reference);
			await page
				.getByRole('button', { name: 'Today, Wednesday, June 18th, 2025, selected' })
				.focus();
			await page.keyboard.press('ArrowRight');
			await expect(page.getByRole('button', { name: 'Friday, June 20th, 2025' })).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await expect(page.getByRole('button', { name: 'Friday, June 27th, 2025' })).toBeFocused();
			await page.keyboard.press('End');
			await expect(page.getByRole('button', { name: 'Saturday, June 28th, 2025' })).toBeFocused();
			await page.keyboard.press('PageDown');
			await expect(page.getByRole('grid')).toHaveAccessibleName('July 2025');
			await expect(page.getByRole('button', { name: 'Monday, July 28th, 2025' })).toBeFocused();
			await page.keyboard.press('Enter');
			await expect(selected).toHaveText('2025-07-28');
			expect(errors).toEqual([]);
		});

		test('only the selected day takes Tab focus', async ({ page }) => {
			await open(page, 'single', reference);
			const days = page.locator('[data-day] button');
			await expect(page.locator('[data-day] button[tabindex="0"]')).toHaveAccessibleName(
				'Today, Wednesday, June 18th, 2025, selected'
			);
			await expect(days.and(page.locator('[tabindex="-1"]'))).toHaveCount((await days.count()) - 1);
		});

		test('disabled days cannot be selected', async ({ page }) => {
			const { selected } = await open(page, 'single', reference);
			const disabled = page.getByRole('button', { name: 'Thursday, June 19th, 2025' });
			await expect(disabled).toBeDisabled();
			await expect(page.locator('[data-day="2025-06-22"]')).toHaveAttribute(
				'data-disabled',
				'true'
			);
			await disabled.click({ force: true });
			await expect(selected).toHaveText('2025-06-18');
		});

		test('clicking the selected day clears it', async ({ page }) => {
			const { selected } = await open(page, 'single', reference);
			const day = page.getByRole('button', { name: 'Today, Wednesday, June 18th, 2025, selected' });
			await expect(page.locator('[data-day="2025-06-18"]')).toHaveAttribute(
				'aria-selected',
				'true'
			);
			await day.click();
			await expect(selected).toHaveText('');
			await expect(page.locator('[data-day="2025-06-18"]')).not.toHaveAttribute('aria-selected');
		});

		test('a range takes two clicks across months and marks the days between', async ({ page }) => {
			const { selected } = await open(page, 'range', reference);
			await expect(page.getByRole('grid')).toHaveCount(2);
			await expect(page.getByRole('grid').first()).toHaveAttribute('aria-multiselectable', 'true');
			await expect(page.getByRole('button', { name: 'Wednesday, June 4th, 2025' })).toBeDisabled();
			await page
				.getByRole('grid', { name: 'June 2025' })
				.getByRole('button', { name: 'Monday, June 30th, 2025' })
				.click();
			await expect(selected).toHaveText('2025-06-30 to 2025-06-30');
			const july = page.getByRole('grid', { name: 'July 2025' });
			await july.getByRole('button', { name: 'Thursday, July 3rd, 2025' }).click();
			await expect(selected).toHaveText('2025-06-30 to 2025-07-03');
			await expect(
				page.getByRole('grid', { name: 'June 2025' }).locator('.rdp-range_start')
			).toHaveText(['30']);
			await expect(july.locator('.rdp-range_middle:not([data-hidden])')).toHaveText(['1', '2']);
			await expect(july.locator('.rdp-range_end')).toHaveText(['3']);
			await page.getByRole('button', { name: 'Go to the Next Month' }).click();
			await expect(page.getByRole('grid').first()).toHaveAccessibleName('July 2025');
		});

		test('multiple mode toggles days and restarts at max', async ({ page }) => {
			const { selected } = await open(page, 'multiple', reference);
			await page.getByRole('button', { name: 'Monday, June 2nd, 2025' }).click();
			await page.getByRole('button', { name: 'Tuesday, June 3rd, 2025' }).click();
			await expect(selected).toHaveText('2025-06-02, 2025-06-03');
			await page.getByRole('button', { name: 'Monday, June 2nd, 2025, selected' }).click();
			await expect(selected).toHaveText('2025-06-03');
			await page.getByRole('button', { name: 'Monday, June 2nd, 2025' }).click();
			await page.getByRole('button', { name: 'Wednesday, June 4th, 2025' }).click();
			await expect(selected).toHaveText('2025-06-04');
			await expect(page.locator('[aria-selected]')).toHaveCount(1);
		});

		test('the dropdowns move the month and report it', async ({ page }) => {
			await open(page, 'dropdown', reference);
			const months = page.getByRole('combobox', { name: 'Choose the Month' });
			const years = page.getByRole('combobox', { name: 'Choose the Year' });
			await expect(months).toHaveValue('5');
			await expect(years).toHaveValue('2025');
			await expect(years.locator('option')).toHaveText(['2024', '2025', '2026']);
			await months.selectOption({ label: 'September' });
			await expect(page.getByTestId('month')).toHaveText('2025-09-01');
			await years.selectOption('2024');
			await expect(page.getByTestId('month')).toHaveText('2024-09-01');
			await expect(page.getByRole('grid')).toHaveAccessibleName('September 2024');
		});

		test('fixed ISO weeks show week numbers and outside days', async ({ page }) => {
			await open(page, 'weeks', reference);
			await expect(page.getByRole('grid')).toHaveAccessibleName('February 2025');
			await expect(page.getByRole('rowheader')).toHaveText(['05', '06', '07', '08', '09', '10']);
			await expect(page.locator('thead th').nth(1)).toHaveText('Mo');
			await expect(page.locator('[data-outside]').first()).toHaveAttribute(
				'data-day',
				'2025-01-27'
			);
			await expect(page.locator('[data-outside]').first()).toHaveAttribute('data-month', '2025-01');
			await expect(page.locator('[data-day]')).toHaveCount(42);
		});
	});
}

test('svelte SSR renders the grid before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/day-picker?case=single')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="grid"');
	expect(html).toContain('aria-label="June 2025"');
	expect(html).toContain('data-mode="single"');
});
