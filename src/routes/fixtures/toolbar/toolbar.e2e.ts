// Each case runs against the Svelte Toolbar and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/toolbar?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { errors };
}

function toolbar(page: Page) {
	return page.getByRole('toolbar', { name: 'Tools' });
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('horizontal arrows move across buttons, the link, and the group', async ({ page }) => {
			const { errors } = await open(page, 'keyboard', reference);
			const bar = toolbar(page);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });
			const three = page.getByRole('button', { name: 'Three' });
			const link = page.getByRole('link', { name: 'Link' });

			await expect(bar).toHaveAttribute('aria-orientation', 'horizontal');
			await expect(bar).toHaveAttribute('data-orientation', 'horizontal');
			await expect(one).toHaveAttribute('tabindex', '0');
			await expect(link).toHaveAttribute('tabindex', '-1');
			await expect(page.getByRole('group')).toHaveAttribute('data-orientation', 'horizontal');

			await one.focus();
			await page.keyboard.press('ArrowRight');
			await expect(link).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(two).toBeFocused();
			await expect(two).toHaveAttribute('tabindex', '0');
			await page.keyboard.press('ArrowRight');
			await expect(three).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(one).toBeFocused();
			await page.keyboard.press('ArrowLeft');
			await expect(three).toBeFocused();

			await three.focus();
			await page.keyboard.press('ArrowDown');
			await expect(three).toBeFocused();
			await page.keyboard.press('Home');
			await expect(three).toBeFocused();
			await page.keyboard.press('End');
			await expect(three).toBeFocused();
			await page.keyboard.press('Shift+ArrowLeft');
			await expect(three).toBeFocused();
			expect(errors).toEqual([]);
		});

		test('vertical arrows move and the other axis does not', async ({ page }) => {
			await open(page, 'vertical', reference);
			const bar = toolbar(page);
			const one = page.getByRole('button', { name: 'One' });
			const link = page.getByRole('link', { name: 'Link' });

			await expect(bar).toHaveAttribute('aria-orientation', 'vertical');
			await expect(bar).toHaveAttribute('data-orientation', 'vertical');
			await one.focus();
			await page.keyboard.press('ArrowDown');
			await expect(link).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(link).toBeFocused();
		});

		test('rtl horizontal arrows are mirrored', async ({ page }) => {
			await open(page, 'rtl', reference);
			const one = page.getByRole('button', { name: 'One' });
			const link = page.getByRole('link', { name: 'Link' });
			await one.focus();
			await page.keyboard.press('ArrowLeft');
			await expect(link).toBeFocused();
			await expect(link).toHaveAttribute('tabindex', '0');
			await page.keyboard.press('ArrowRight');
			await expect(one).toBeFocused();
		});

		test('loopFocus false stays on the end item', async ({ page }) => {
			await open(page, 'loop', reference);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });
			await one.focus();
			await page.keyboard.press('ArrowLeft');
			await expect(one).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(two).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(two).toBeFocused();
		});

		test('disabled toolbar disables buttons and the group, not links', async ({ page }) => {
			await open(page, 'disabled', reference);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });
			await expect(one).toHaveAttribute('aria-disabled', 'true');
			await expect(one).toHaveAttribute('data-disabled', '');
			await expect(one).not.toHaveAttribute('disabled');
			await expect(two).toHaveAttribute('data-disabled', '');
			await expect(page.getByRole('group')).toHaveAttribute('data-disabled', '');
			await expect(page.getByRole('link', { name: 'Link' })).not.toHaveAttribute('aria-disabled');
			await expect(page.getByRole('link', { name: 'Docs' })).not.toHaveAttribute('data-disabled');
		});

		test('disabled buttons stay in the arrow order', async ({ page }) => {
			await open(page, 'focusable', reference);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });
			const three = page.getByRole('button', { name: 'Three' });
			await expect(one).toHaveAttribute('data-focusable', '');
			await expect(one).not.toHaveAttribute('disabled');
			await one.focus();
			await page.keyboard.press('ArrowRight');
			await expect(two).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(three).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(one).toBeFocused();
		});

		test('a non-focusable disabled button is skipped', async ({ page }) => {
			await open(page, 'skip', reference);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });
			const three = page.getByRole('button', { name: 'Three' });
			await expect(two).toHaveAttribute('disabled');
			await expect(two).not.toHaveAttribute('tabindex', '0');
			await one.focus();
			await page.keyboard.press('ArrowRight');
			await expect(three).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(one).toBeFocused();
		});

		test('Space, Enter, and click activate once, and a disabled button does not', async ({
			page
		}) => {
			await open(page, 'activate', reference);
			const one = page.getByRole('button', { name: 'One' });
			const two = page.getByRole('button', { name: 'Two' });
			const clicks = page.getByTestId('clicks');

			await one.focus();
			await page.keyboard.press('Space');
			await expect(clicks).toHaveText('1');
			await page.keyboard.press('Enter');
			await expect(clicks).toHaveText('2');
			await one.click();
			await expect(clicks).toHaveText('3');

			await two.focus();
			await page.keyboard.press('Space');
			await page.keyboard.press('Enter');
			await two.click({ force: true });
			await expect(clicks).toHaveText('3');
		});

		test('a custom element clicks once from Space', async ({ page }) => {
			await open(page, 'custom', reference);
			const save = page.getByRole('button', { name: 'Save' });
			await expect(save).toHaveAttribute('role', 'button');
			await save.focus();
			await page.keyboard.press('Space');
			await expect(page.getByTestId('clicks')).toHaveText('1');
			await page.keyboard.press('Enter');
			await expect(page.getByTestId('clicks')).toHaveText('2');
		});
	});
}

test('server html includes the toolbar role and roving tabindex', async ({ request }) => {
	const html = await (await request.get('/fixtures/toolbar?case=keyboard')).text();
	expect(html).toContain('role="toolbar"');
	expect(html).toContain('aria-orientation="horizontal"');
	expect(html).toContain('data-orientation="horizontal"');
	expect(html).toContain('tabindex="0"');
	expect(html).toContain('tabindex="-1"');
	expect(html).not.toContain('data-disabled');
});
