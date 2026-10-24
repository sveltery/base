// The separator takes 8px of the 600px group, so a 60px drag moves it by 60 / 592 of the panels.
// Each case runs against the Svelte Resizable and the React react-resizable-panels 4.5.8 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const opened = await openFixture(page, 'resizable', scenario, reference);
	return {
		separator: page.getByRole('separator'),
		first: page.locator('#first'),
		second: page.locator('#second'),
		layout: page.getByTestId('layout'),
		errors: opened.errors
	};
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('renders the group, panels and separator attributes', async ({ page }) => {
			const { separator, first, second, layout, errors } = await open(
				page,
				'horizontal',
				reference
			);
			const group = page.locator('#group');
			await expect(group).toHaveAttribute('data-group', 'true');
			await expect(group).toHaveAttribute('data-testid', 'group');
			await expect(first).toHaveAttribute('data-panel', 'true');
			await expect(first).toHaveAttribute('data-testid', 'first');
			await expect(first).toHaveCSS('flex-grow', '30');
			await expect(second).toHaveCSS('flex-grow', '70');
			await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
			await expect(separator).toHaveAttribute('aria-controls', 'first');
			await expect(separator).toHaveAttribute('aria-valuenow', '30');
			await expect(separator).toHaveAttribute('aria-valuemin', '10');
			await expect(separator).toHaveAttribute('aria-valuemax', '80');
			await expect(separator).toHaveAttribute('tabindex', '0');
			await expect(separator).toHaveAttribute('data-separator', 'inactive');
			await expect(layout).toHaveText('{"first":30,"second":70}');
			expect(errors).toEqual([]);
		});

		test('resizes with the arrow keys, Home and End', async ({ page }) => {
			const { separator, first, layout } = await open(page, 'horizontal', reference);
			await separator.focus();
			await page.keyboard.press('ArrowRight');
			await expect(separator).toHaveAttribute('aria-valuenow', '35');
			await expect(first).toHaveCSS('flex-grow', '35');
			await expect(layout).toHaveText('{"first":35,"second":65}');
			await page.keyboard.press('ArrowDown');
			await expect(separator).toHaveAttribute('aria-valuenow', '35');
			await page.keyboard.press('Home');
			await expect(separator).toHaveAttribute('aria-valuenow', '10');
			await page.keyboard.press('End');
			await expect(separator).toHaveAttribute('aria-valuenow', '80');
			await expect(layout).toHaveText('{"first":80,"second":20}');
		});

		test('a vertical group resizes with ArrowUp and ArrowDown', async ({ page }) => {
			const { separator, first } = await open(page, 'vertical', reference);
			await expect(page.locator('#group')).toHaveCSS('flex-direction', 'column');
			await expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
			await separator.focus();
			await page.keyboard.press('ArrowDown');
			await expect(separator).toHaveAttribute('aria-valuenow', '35');
			await page.keyboard.press('ArrowRight');
			await expect(separator).toHaveAttribute('aria-valuenow', '35');
			await page.keyboard.press('ArrowUp');
			await expect(first).toHaveCSS('flex-grow', '30');
		});

		test('dragging the separator resizes the panels and settles on release', async ({ page }) => {
			const { separator, layout } = await open(page, 'horizontal', reference);
			const box = (await separator.boundingBox())!;
			const x = box.x + box.width / 2;
			const y = box.y + box.height / 2;
			await page.mouse.move(x, y);
			await expect(separator).toHaveAttribute('data-separator', 'hover');
			await page.mouse.down();
			await expect(separator).toHaveAttribute('data-separator', 'active');
			await page.mouse.move(x + 60, y, { steps: 4 });
			await expect(separator).toHaveAttribute('aria-valuenow', '40.135');
			await expect(layout).toHaveText('{"first":30,"second":70}');
			await page.mouse.up();
			await expect(layout).toHaveText('{"first":40.135,"second":59.865}');
			await page.mouse.move(x + 200, y + 200);
			await expect(separator).toHaveAttribute('data-separator', 'inactive');
		});

		test('a collapsible panel collapses with Enter and through its methods', async ({ page }) => {
			const { separator, first } = await open(page, 'collapsible', reference);
			await separator.focus();
			await page.keyboard.press('Enter');
			await expect(first).toHaveCSS('flex-grow', '0');
			await page.keyboard.press('Enter');
			await expect(first).toHaveCSS('flex-grow', '30');
			await page.getByRole('button', { name: 'Collapse' }).click();
			await expect(separator).toHaveAttribute('aria-valuenow', '0');
			await page.getByRole('button', { name: 'Expand' }).click();
			await expect(separator).toHaveAttribute('aria-valuenow', '30');
			await page.getByRole('button', { name: 'Half' }).click();
			await expect(separator).toHaveAttribute('aria-valuenow', '50');
		});

		test('a panel that cannot collapse ignores Enter', async ({ page }) => {
			const { separator } = await open(page, 'horizontal', reference);
			await separator.focus();
			await page.keyboard.press('Enter');
			await expect(separator).toHaveAttribute('aria-valuenow', '30');
		});

		test('a disabled group ignores the keyboard', async ({ page }) => {
			const { separator } = await open(page, 'disabled', reference);
			await separator.focus();
			await page.keyboard.press('ArrowRight');
			await page.keyboard.press('End');
			await expect(separator).toHaveAttribute('aria-valuenow', '30');
		});
	});
}

test('svelte SSR renders the group, panels and separator before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/resizable?case=horizontal')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('data-group="true"');
	expect(html).toContain('data-panel="true"');
	expect(html).toContain('role="separator"');
	expect(html).toContain('data-separator="inactive"');
});
