// Each case runs against the Svelte DirectionProvider and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'direction-provider', scenario, reference);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('defaults to ltr outside a provider', async ({ page }) => {
			const { errors } = await open(page, 'outside', reference);
			await expect(page.getByTestId('direction')).toHaveText('ltr');
			expect(errors).toEqual([]);
		});

		test('an omitted direction prop is ltr', async ({ page }) => {
			await open(page, 'omitted', reference);
			await expect(page.getByTestId('direction')).toHaveText('ltr');
		});

		test('provides rtl to descendants', async ({ page }) => {
			await open(page, 'rtl', reference);
			await expect(page.getByTestId('direction')).toHaveText('rtl');
		});

		test('direction follows the provider when it changes', async ({ page }) => {
			await open(page, 'reactive', reference);
			const probe = page.getByTestId('direction');
			const flip = page.getByRole('button', { name: 'Flip direction' });
			await expect(probe).toHaveText('rtl');
			await flip.click();
			await expect(probe).toHaveText('ltr');
			await flip.click();
			await expect(probe).toHaveText('rtl');
		});

		test('a nested provider replaces the outer direction', async ({ page }) => {
			await open(page, 'nested', reference);
			await expect(page.getByTestId('outer')).toHaveText('rtl');
			await expect(page.getByTestId('inner')).toHaveText('ltr');
		});
	});
}

test('svelte SSR renders the provided direction before hydration', async ({ request }) => {
	const outside = await (await request.get('/fixtures/direction-provider?case=outside')).text();
	expect(outside).toContain('data-hydrated="false"');
	expect(outside).toContain('data-testid="direction">ltr</span>');

	const rtl = await (await request.get('/fixtures/direction-provider?case=rtl')).text();
	expect(rtl).toContain('data-testid="direction">rtl</span>');

	const nested = await (await request.get('/fixtures/direction-provider?case=nested')).text();
	expect(nested).toContain('data-testid="outer">rtl</span>');
	expect(nested).toContain('data-testid="inner">ltr</span>');
});
