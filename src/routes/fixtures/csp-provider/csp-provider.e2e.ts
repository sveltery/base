// Each case runs against the Svelte CSPProvider and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'csp-provider', scenario, reference);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('defaults disableStyleElements to false outside a provider', async ({ page }) => {
			const { errors } = await open(page, 'outside', reference);
			await expect(page.getByTestId('csp-nonce')).toHaveText('undefined');
			await expect(page.getByTestId('csp-styles')).toHaveText('false');
			expect(errors).toEqual([]);
		});

		test('an omitted provider leaves nonce and disableStyleElements undefined', async ({
			page
		}) => {
			await open(page, 'omitted', reference);
			await expect(page.getByTestId('csp-nonce')).toHaveText('undefined');
			await expect(page.getByTestId('csp-styles')).toHaveText('undefined');
		});

		test('provides a nonce to descendants', async ({ page }) => {
			await open(page, 'nonce', reference);
			await expect(page.getByTestId('csp-nonce')).toHaveText('test-nonce');
			await expect(page.getByTestId('csp-styles')).toHaveText('undefined');
		});

		test('provides disableStyleElements so descendants can skip inline style tags', async ({
			page
		}) => {
			await open(page, 'disabled', reference);
			await expect(page.getByTestId('csp-nonce')).toHaveText('undefined');
			await expect(page.getByTestId('csp-styles')).toHaveText('true');
		});

		test('nonce and disableStyleElements follow the provider when they change', async ({
			page
		}) => {
			await open(page, 'reactive', reference);
			const nonce = page.getByTestId('csp-nonce');
			const styles = page.getByTestId('csp-styles');
			const update = page.getByRole('button', { name: 'Update CSP' });
			await expect(nonce).toHaveText('test-nonce');
			await expect(styles).toHaveText('false');
			await update.click();
			await expect(nonce).toHaveText('next-nonce');
			await expect(styles).toHaveText('true');
			await update.click();
			await expect(nonce).toHaveText('test-nonce');
			await expect(styles).toHaveText('false');
		});

		test('a nested provider replaces the outer configuration', async ({ page }) => {
			await open(page, 'nested', reference);
			await expect(page.getByTestId('outer-nonce')).toHaveText('outer-nonce');
			await expect(page.getByTestId('outer-styles')).toHaveText('false');
			await expect(page.getByTestId('inner-nonce')).toHaveText('undefined');
			await expect(page.getByTestId('inner-styles')).toHaveText('true');
		});
	});
}

test('svelte SSR renders the CSP reading before hydration', async ({ request }) => {
	const outside = await (await request.get('/fixtures/csp-provider?case=outside')).text();
	expect(outside).toContain('data-hydrated="false"');
	expect(outside).toContain('data-testid="csp-nonce">undefined</span>');
	expect(outside).toContain('data-testid="csp-styles">false</span>');

	const nonce = await (await request.get('/fixtures/csp-provider?case=nonce')).text();
	expect(nonce).toContain('data-testid="csp-nonce">test-nonce</span>');
	expect(nonce).toContain('data-testid="csp-styles">undefined</span>');

	const nested = await (await request.get('/fixtures/csp-provider?case=nested')).text();
	expect(nested).toContain('data-testid="outer-nonce">outer-nonce</span>');
	expect(nested).toContain('data-testid="outer-styles">false</span>');
	expect(nested).toContain('data-testid="inner-nonce">undefined</span>');
	expect(nested).toContain('data-testid="inner-styles">true</span>');
});
