// Each case runs against the Svelte NavigationMenu and the React Base UI 1.9.0 reference.
import { expect, test, type Locator, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/navigation-menu?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return {
		overview: page.getByRole('button', { name: 'Overview' }),
		handbook: page.getByRole('button', { name: 'Handbook' }),
		overviewContent: page.getByTestId('overview-content'),
		handbookContent: page.getByTestId('handbook-content'),
		popup: page.getByTestId('popup'),
		positioner: page.getByTestId('positioner'),
		outside: page.getByRole('button', { name: 'Outside' }),
		errors
	};
}

async function recorded(page: Page) {
	const text = await page.getByTestId('calls').innerText();
	return JSON.parse(text) as Array<{ value: string | null; reason: string }>;
}

/** Moves the pointer across the list from one trigger to another, the way a person sweeps. */
async function sweep(page: Page, from: Locator, to: Locator) {
	const start = (await from.boundingBox())!;
	const end = (await to.boundingBox())!;
	await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
	await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 12 });
}

function cssVar(page: Page, testId: string, name: string) {
	return page
		.getByTestId(testId)
		.evaluate(
			(element, variable) => (element as HTMLElement).style.getPropertyValue(variable),
			name
		);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('hover opens the hovered item and records the reason', async ({ page }) => {
			const { overview, overviewContent, popup, errors } = await open(
				page,
				'standalone',
				reference
			);
			await expect(popup).toHaveCount(0);
			await expect(overview).toHaveAttribute('aria-expanded', 'false');

			await overview.hover();
			await expect(overviewContent).toBeVisible();
			await expect(overview).toHaveAttribute('aria-expanded', 'true');
			await expect(overview).toHaveAttribute('data-popup-open', '');
			await expect(page.getByTestId('overview-icon')).toHaveAttribute('data-popup-open', '');
			await expect(popup).toHaveAttribute('data-open', '');
			await expect(page.getByTestId('value')).toHaveText('overview');
			expect(await recorded(page)).toEqual([{ value: 'overview', reason: 'trigger-hover' }]);
			expect(errors).toEqual([]);
		});

		test('the positioner takes the size of the active content', async ({ page }) => {
			const { overview, handbook, handbookContent } = await open(page, 'standalone', reference);
			await overview.hover();
			await expect.poll(() => cssVar(page, 'positioner', '--positioner-width')).toBe('400px');
			await expect.poll(() => cssVar(page, 'positioner', '--positioner-height')).toBe('160px');
			await expect.poll(() => cssVar(page, 'popup', '--popup-width')).toBe('auto');

			await sweep(page, overview, handbook);
			await expect(handbookContent).toBeVisible();
			await expect.poll(() => cssVar(page, 'positioner', '--positioner-width')).toBe('300px');
			await expect.poll(() => cssVar(page, 'positioner', '--positioner-height')).toBe('100px');
		});

		test('switching items to the right marks the activation direction', async ({ page }) => {
			const { overview, handbook, handbookContent } = await open(page, 'standalone', reference);
			await overview.hover();
			await expect(page.getByTestId('overview-content')).toBeVisible();

			await sweep(page, overview, handbook);
			await expect(handbookContent).toHaveAttribute('data-activation-direction', 'right');
			await expect(handbook).toHaveAttribute('aria-expanded', 'true');
			await expect(overview).toHaveAttribute('aria-expanded', 'false');
		});

		test('a click opens and a second click closes', async ({ page }) => {
			const { handbook, handbookContent, popup } = await open(page, 'standalone', reference);
			await handbook.click();
			await expect(handbookContent).toBeVisible();

			await page.mouse.move(0, 0);
			await handbook.click({ force: true });
			await expect(popup).toHaveCount(0);
			expect(await recorded(page)).toEqual([
				{ value: 'handbook', reason: 'trigger-press' },
				{ value: null, reason: 'trigger-press' }
			]);
		});

		test('focusing a control outside closes the menu', async ({ page }) => {
			const { overview, popup, outside } = await open(page, 'standalone', reference);
			await overview.click();
			await expect(popup).toBeVisible();

			await outside.click({ force: true });
			await expect(popup).toHaveCount(0);
			expect((await recorded(page)).at(-1)).toEqual({ value: null, reason: 'focus-out' });
		});

		test('the keyboard opens an item, tabs into it and escapes back', async ({ page }) => {
			const { overview, handbook, overviewContent, popup } = await open(
				page,
				'standalone',
				reference
			);
			await overview.focus();
			await page.keyboard.press('ArrowRight');
			await expect(handbook).toBeFocused();
			await page.keyboard.press('ArrowLeft');
			await expect(overview).toBeFocused();

			await page.keyboard.press('Enter');
			await expect(overviewContent).toBeVisible();
			await expect(overview).toBeFocused();

			await page.keyboard.press('Tab');
			await expect(page.getByRole('link', { name: 'Quick Start' })).toBeFocused();

			await page.keyboard.press('Escape');
			await expect(popup).toHaveCount(0);
			await expect(overview).toBeFocused();
			expect(await recorded(page)).toEqual([
				{ value: 'overview', reason: 'trigger-press' },
				{ value: null, reason: 'escape-key' }
			]);
		});

		test('tabbing out of the content to the next item keeps the menu open', async ({ page }) => {
			const { handbook, popup } = await open(page, 'standalone', reference);
			await handbook.focus();
			await page.keyboard.press('Enter');
			await expect(popup).toBeVisible();

			await page.keyboard.press('Tab');
			await expect(page.getByRole('link', { name: 'Styling' })).toBeFocused();
			await page.keyboard.press('Tab');
			await expect(page.getByRole('link', { name: 'Animation' })).toBeFocused();
			await page.keyboard.press('Tab');
			await expect(page.getByRole('link', { name: 'GitHub' })).toBeFocused();
			await expect(popup).toBeVisible();

			await page.keyboard.press('Shift+Tab');
			await expect(page.getByRole('link', { name: 'Animation' })).toBeFocused();
		});

		test('a closeOnClick link closes the menu', async ({ page }) => {
			const { overview, popup } = await open(page, 'standalone', reference);
			await overview.click();
			await expect(popup).toBeVisible();

			await page.getByRole('link', { name: 'Quick Start' }).click();
			await expect(popup).toHaveCount(0);
			expect((await recorded(page)).at(-1)).toEqual({ value: null, reason: 'link-press' });
		});

		test('the open and close delays hold the menu', async ({ page }) => {
			const { overview, overviewContent, popup, outside } = await open(page, 'delays', reference);
			await overview.hover();
			await page.waitForTimeout(200);
			await expect(popup).toHaveCount(0);
			await expect(overviewContent).toBeVisible();

			await outside.hover({ force: true });
			await page.waitForTimeout(200);
			await expect(popup).toBeVisible();
			await expect(popup).toHaveCount(0);
		});

		test('a vertical menu moves between triggers with the up and down arrows', async ({ page }) => {
			const { overview, handbook, overviewContent } = await open(page, 'vertical', reference);
			await overview.focus();
			await page.keyboard.press('ArrowDown');
			await expect(handbook).toBeFocused();
			await page.keyboard.press('ArrowUp');
			await expect(overview).toBeFocused();

			await page.keyboard.press('ArrowRight');
			await expect(overviewContent).toBeVisible();
			await expect(overview).toBeFocused();
		});

		test('a bound value opens and closes the menu', async ({ page }) => {
			const { handbook, handbookContent, popup } = await open(page, 'bound', reference);
			await page.getByTestId('show').click();
			await expect(handbookContent).toBeVisible();
			await expect(handbook).toHaveAttribute('aria-expanded', 'true');
			await expect(page.getByTestId('value')).toHaveText('handbook');

			await page.getByTestId('hide').click({ force: true });
			await expect(popup).toHaveCount(0);
			await expect(handbook).toHaveAttribute('aria-expanded', 'false');
			await expect(page.getByTestId('value')).toHaveText('null');
		});

		test('pressing a control outside a bound menu reports an outside press', async ({ page }) => {
			test.fixme(
				!reference,
				'floating-ui-svelte DismissInteraction listens for click on the document in the bubble phase, so the Hide handler closes the menu first'
			);
			const { popup } = await open(page, 'bound', reference);
			await page.getByTestId('show').click();
			await expect(popup).toBeVisible();

			await page.getByTestId('hide').click({ force: true });
			await expect(popup).toHaveCount(0);
			expect(await recorded(page)).toEqual([{ value: null, reason: 'outside-press' }]);
		});

		test('an inline nested menu shows its default item and switches on hover', async ({ page }) => {
			await open(page, 'nested', reference);
			const product = page.getByRole('button', { name: 'Product' });
			await product.click();
			await expect(page.getByTestId('developers-content')).toBeVisible();
			await expect(page.getByRole('button', { name: 'Developers' })).toHaveAttribute(
				'aria-expanded',
				'true'
			);

			await page.getByRole('button', { name: 'Design' }).hover();
			await expect(page.getByTestId('design-content')).toBeVisible();
			await expect(page.getByTestId('developers-content')).toHaveCount(0);
			await expect(product).toHaveAttribute('aria-expanded', 'true');
		});

		test('a nested closeOnClick link closes every level', async ({ page }) => {
			const { popup } = await open(page, 'nested', reference);
			await page.getByRole('button', { name: 'Product' }).click();
			await page.getByRole('button', { name: 'Design' }).click();
			await expect(page.getByTestId('design-content')).toBeVisible();

			await page.getByRole('link', { name: 'Design guide' }).click();
			await expect(popup).toHaveCount(0);
			expect((await recorded(page)).at(-1)).toEqual({ value: null, reason: 'link-press' });
		});
	});
}

test('svelte SSR renders closed triggers before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/navigation-menu?case=standalone')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('Overview');
	expect(html).toContain('aria-expanded="false"');
	expect(html).not.toContain('data-popup-open');
	expect(html).not.toContain('Quick Start');
});
