// Each case runs against the Svelte Slider and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/slider?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { errors };
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('steps the value from the keyboard', async ({ page }) => {
			const { errors } = await open(page, 'plain', reference);
			const slider = page.getByRole('slider');
			await expect(slider).toHaveAttribute('aria-valuenow', '30');
			await slider.focus();
			await page.keyboard.press('ArrowRight');
			await expect(slider).toHaveAttribute('aria-valuenow', '31');
			await page.keyboard.press('ArrowLeft');
			await expect(slider).toHaveAttribute('aria-valuenow', '30');
			expect(errors).toEqual([]);
		});

		test('associates the label after hydration', async ({ page }) => {
			const { errors } = await open(page, 'labelled', reference);
			const label = page.getByTestId('label');
			const slider = page.getByRole('slider', { name: 'Volume' });
			await expect(label).toHaveAttribute('id', /^base-ui-/);
			const id = await label.getAttribute('id');
			await expect(slider).toHaveAttribute('aria-labelledby', id!);
			expect(errors).toEqual([]);
		});

		test('shows a range with an en dash', async ({ page }) => {
			await open(page, 'range', reference);
			await expect(page.getByTestId('value')).toHaveText('40 \u2013 65');
			await expect(page.getByRole('slider')).toHaveCount(2);
		});

		test('keeps a bound value in sync', async ({ page }) => {
			await open(page, 'bound', reference);
			const slider = page.getByRole('slider');
			await expect(slider).toHaveAttribute('aria-valuenow', '30');
			await expect(page.getByTestId('value')).toHaveText('30');
			await slider.focus();
			await page.keyboard.press('ArrowRight');
			await expect(slider).toHaveAttribute('aria-valuenow', '31');
			await expect(page.getByTestId('value')).toHaveText('31');
		});

		test('does not change a disabled slider', async ({ page }) => {
			await open(page, 'disabled', reference);
			const slider = page.getByRole('slider');
			await expect(page.getByTestId('root')).toHaveAttribute('data-disabled', '');
			await expect(slider).toBeDisabled();
			await expect(slider).toHaveAttribute('aria-valuenow', '30');
		});

		test('increases a vertical slider with ArrowUp', async ({ page }) => {
			await open(page, 'vertical', reference);
			const slider = page.getByRole('slider');
			await expect(slider).toHaveAttribute('aria-orientation', 'vertical');
			await slider.focus();
			await page.keyboard.press('ArrowUp');
			await expect(slider).toHaveAttribute('aria-valuenow', '31');
		});
	});
}

test('svelte SSR does not link the label before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/slider?case=labelled')).text();
	expect(html).toContain('data-hydrated="false"');
	const tags = html.match(/<[^>]+>/g) ?? [];
	const labelTag = tags.find((tag) => tag.includes('data-testid="label"'));
	const rootTag = tags.find((tag) => tag.includes('data-testid="root"'));
	const labelId = labelTag?.match(/\sid="([^"]+)"/)?.[1];
	const rootId = rootTag?.match(/\sid="([^"]+)"/)?.[1];
	expect(labelId).toMatch(/^base-ui-.+-label$/);
	expect(rootId).toMatch(/^base-ui-/);
	expect(labelId).toBe(`${rootId}-label`);
	expect(html).not.toContain('aria-labelledby');
});
