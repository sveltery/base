// Each case runs against the Svelte Tabs and the React Base UI 1.9.0 reference.
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'tabs', scenario, reference);
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
			await expect(page.getByRole('tabpanel', { name: 'One' })).toHaveText('One panel');

			await two.click();
			await expect(two).toHaveAttribute('aria-selected', 'true');
			await expect(two).toHaveAttribute('data-active', '');
			await expect(one).toHaveAttribute('aria-selected', 'false');
			await expect(page.getByRole('tabpanel', { name: 'Two' })).toHaveText('Two panel');
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
			await expect(page.getByRole('tabpanel', { name: 'Two' })).toHaveText('Two panel');
		});

		test('activateOnFocus selects with the arrow key', async ({ page }) => {
			await open(page, 'follow', reference);
			await page.getByRole('tab', { name: 'One' }).focus();
			await page.keyboard.press('ArrowRight');
			await expect(page.getByRole('tab', { name: 'Two' })).toHaveAttribute('aria-selected', 'true');
			await expect(page.getByRole('tabpanel', { name: 'Two' })).toHaveText('Two panel');
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

		test('the indicator is positioned over the active tab', async ({ page }) => {
			await open(page, 'prehydrate', reference);
			const indicator = page.getByTestId('indicator');
			const one = page.getByRole('tab', { name: 'One' });

			await expect(indicator).not.toHaveAttribute('hidden');
			const width = await one.evaluate((tab) => getComputedStyle(tab).width);
			await expect(indicator).toHaveCSS('--active-tab-width', width);
			await expect(indicator).toHaveCSS('--active-tab-left', '0px');
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

const SCRIPT_START = '<script>!function(){const t=document.currentScript.previousElementSibling;';

async function prehydrationScript(request: APIRequestContext) {
	const html = await (await request.get('/fixtures/tabs?case=prehydrate')).text();
	const start = html.indexOf(SCRIPT_START);
	expect(start).toBeGreaterThan(-1);
	return html.slice(start + '<script>'.length, html.indexOf('</script>', start));
}

test.describe('svelte prehydration script', () => {
	test('SSR renders the script after the indicator only for renderBeforeHydration', async ({
		request
	}) => {
		const enabled = await (await request.get('/fixtures/tabs?case=prehydrate')).text();
		const disabled = await (await request.get('/fixtures/tabs?case=select')).text();
		expect(enabled).toMatch(
			/<\/span>(?:<!--[^>]*-->|\s)*<script>!function\(\)\{const t=document\.currentScript\.previousElementSibling;/
		);
		expect(disabled).not.toContain(SCRIPT_START);
	});

	test('positions the indicator before any script bundle loads', async ({ page }) => {
		await page.route(/\.js(\?.*)?$/, (route) => route.abort());
		await page.goto('/fixtures/tabs?case=prehydrate');
		const indicator = page.getByTestId('indicator');
		const one = page.getByRole('tab', { name: 'One' });

		await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'false');
		await expect(indicator).not.toHaveAttribute('hidden');
		const width = await one.evaluate((tab) => getComputedStyle(tab).width);
		await expect(indicator).toHaveCSS('--active-tab-width', width);
		await expect(indicator).toHaveCSS('--active-tab-left', '0px');
	});

	test('leaves the indicator hidden without the script', async ({ page }) => {
		await page.route(/\.js(\?.*)?$/, (route) => route.abort());
		await page.goto('/fixtures/tabs?case=select');

		await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'false');
		await expect(page.getByTestId('indicator')).toHaveAttribute('hidden', '');
	});

	test.describe('script execution', () => {
		const tab = 'padding: 0; border: 0; height: 40px;';

		async function mount(
			page: Page,
			request: APIRequestContext,
			{ hidden = false, activeTabStyle = 'width: 100px;' } = {}
		) {
			const script = await prehydrationScript(request);
			await page.goto('about:blank');
			await page.setContent(
				`<div id="host" style="${hidden ? 'display: none' : ''}">` +
					'<div role="tablist" style="width: 300px; height: 40px; position: relative;">' +
					`<button data-active style="${tab} ${activeTabStyle}">One</button>` +
					`<button style="${tab} width: 100px;">Two</button>` +
					`<span hidden></span><script>${script}</script></div></div>`
			);
			return page.locator('span');
		}

		test('positions the indicator once a hidden segment becomes visible', async ({
			page,
			request
		}) => {
			const indicator = await mount(page, request, { hidden: true });
			await expect(indicator).toHaveAttribute('hidden', '');

			await page.locator('#host').evaluate((host) => ((host as HTMLElement).style.display = ''));

			await expect(indicator).not.toHaveAttribute('hidden');
			await expect(indicator).toHaveCSS('--active-tab-width', '100px');
			await expect(indicator).toHaveCSS('--active-tab-height', '40px');
		});

		test('does not reveal the indicator when the captured tab is no longer active', async ({
			page,
			request
		}) => {
			const indicator = await mount(page, request, { hidden: true });

			await page.locator('[data-active]').evaluate((node) => node.removeAttribute('data-active'));
			await page.locator('#host').evaluate((host) => ((host as HTMLElement).style.display = ''));
			await page.waitForTimeout(150);

			await expect(indicator).toHaveAttribute('hidden', '');
		});

		test('stops once hydration has revealed the indicator', async ({ page, request }) => {
			const indicator = await mount(page, request, { hidden: true });

			await indicator.evaluate((node) => {
				node.removeAttribute('hidden');
				node.style.setProperty('--active-tab-width', '55px');
			});
			await page.locator('#host').evaluate((host) => ((host as HTMLElement).style.display = ''));
			await page.waitForTimeout(150);
			await expect(indicator).toHaveCSS('--active-tab-width', '55px');

			await page.locator('[role="tablist"]').evaluate((list) => (list.style.width = '500px'));
			await page.waitForTimeout(150);
			await expect(indicator).toHaveCSS('--active-tab-width', '55px');
		});

		test('keeps observing until the active tab is fully measurable', async ({ page, request }) => {
			const indicator = await mount(page, request, {
				activeTabStyle: 'width: 100px; height: 0; overflow: hidden;'
			});
			await page.waitForTimeout(150);
			await expect(indicator).toHaveAttribute('hidden', '');

			await page.locator('[data-active]').evaluate((node) => (node.style.height = '40px'));

			await expect(indicator).not.toHaveAttribute('hidden');
		});

		test('skips a transformed active tab', async ({ page, request }) => {
			const indicator = await mount(page, request, {
				activeTabStyle: 'width: 100px; transform: translateX(12px);'
			});

			await expect(indicator).toHaveAttribute('hidden', '');
			await expect(indicator).toHaveCSS('--active-tab-width', '');
		});
	});
});
