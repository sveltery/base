// Each case runs against the Svelte Fieldset and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'fieldset', scenario, reference);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('generated legend id is associated after registration', async ({ page }) => {
			const { errors } = await open(page, 'labelled', reference);
			const fieldset = page.getByTestId('fieldset');
			const legend = page.getByTestId('legend');
			await expect(legend).toHaveAttribute('id', /^base-ui-/);
			const id = await legend.getAttribute('id');
			await expect(fieldset).toHaveAttribute('aria-labelledby', id!);
			await expect(page.getByRole('group', { name: 'Legend' })).toBeVisible();
			expect(errors).toEqual([]);
		});

		test('custom legend id is associated', async ({ page }) => {
			await open(page, 'custom-id', reference);
			await expect(page.getByTestId('legend')).toHaveAttribute('id', 'legend-id');
			await expect(page.getByTestId('fieldset')).toHaveAttribute('aria-labelledby', 'legend-id');
		});

		test('disabled fieldset disables its input', async ({ page }) => {
			await open(page, 'disabled', reference);
			const fieldset = page.getByTestId('fieldset');
			// Playwright treats a disabled <fieldset> as enabled; the attribute and the input are the contract.
			await expect(fieldset).toHaveAttribute('disabled', '');
			await expect(fieldset).toHaveAttribute('data-disabled', '');
			await expect(fieldset).not.toHaveAttribute('aria-labelledby');
			await expect(page.getByRole('textbox', { name: 'Name' })).toBeDisabled();
		});

		test('nested disabled follows the ancestor and the local prop', async ({ page }) => {
			await open(page, 'nested', reference);
			const outer = page.getByTestId('outer');
			const inner = page.getByTestId('inner');
			const input = page.getByRole('textbox', { name: 'Name' });

			await expect(inner).toHaveAttribute('disabled', '');
			await expect(inner).toHaveAttribute('data-disabled', '');
			await expect(outer).not.toHaveAttribute('disabled');
			await expect(input).toBeDisabled();

			await page.getByRole('button', { name: 'Disable outer' }).click();
			await page.getByRole('button', { name: 'Enable inner' }).click();
			await expect(outer).toHaveAttribute('disabled', '');
			await expect(inner).toHaveAttribute('disabled', '');
			await expect(inner).toHaveAttribute('data-disabled', '');
			await expect(input).toBeDisabled();

			await page.getByRole('button', { name: 'Enable outer' }).click();
			await expect(outer).not.toHaveAttribute('disabled');
			await expect(inner).not.toHaveAttribute('disabled');
			await expect(inner).not.toHaveAttribute('data-disabled');
			await expect(input).toBeEnabled();
		});

		test('changing or removing the legend updates aria-labelledby', async ({ page }) => {
			await open(page, 'dynamic', reference);
			const fieldset = page.getByTestId('fieldset');
			await expect(fieldset).toHaveAttribute('aria-labelledby', 'legend-a');
			await page.getByRole('button', { name: 'Change id' }).click();
			await expect(fieldset).toHaveAttribute('aria-labelledby', 'legend-b');
			await page.getByRole('button', { name: 'Remove legend' }).click();
			await expect(fieldset).not.toHaveAttribute('aria-labelledby');
		});

		test('an older legend unmount does not clear a newer legend', async ({ page }) => {
			await open(page, 'labels', reference);
			const fieldset = page.getByTestId('fieldset');
			await expect(fieldset).toHaveAttribute('aria-labelledby', 'old-label');
			await page.getByRole('button', { name: 'Show both' }).click();
			await expect(fieldset).toHaveAttribute('aria-labelledby', 'new-label');
			await page.getByRole('button', { name: 'Show new' }).click();
			await expect(fieldset).toHaveAttribute('aria-labelledby', 'new-label');
			await expect(page.getByTestId('old')).toHaveCount(0);
		});

		test('each legend labels its nearest fieldset', async ({ page }) => {
			await open(page, 'nested-labels', reference);
			await expect(page.getByTestId('outer')).toHaveAttribute('aria-labelledby', 'outer-legend');
			await expect(page.getByTestId('inner')).toHaveAttribute('aria-labelledby', 'inner-legend');
		});
	});
}

test('svelte SSR renders the legend id without aria-labelledby', async ({ request }) => {
	const html = await (await request.get('/fixtures/fieldset?case=labelled')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).not.toContain('aria-labelledby');
	expect(html).toMatch(
		/data-testid="legend"[^>]*\sid="base-ui-[^"]+"|\sid="base-ui-[^"]+"[^>]*data-testid="legend"/
	);
});

test('svelte SSR omits aria-labelledby when no legend is rendered', async ({ request }) => {
	const html = await (await request.get('/fixtures/fieldset?case=disabled')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).not.toContain('aria-labelledby');
	expect(html).toMatch(/<fieldset[^>]*\sdisabled(?:=|"|\s|>)/);
});
