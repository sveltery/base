// Each case runs against the Svelte ScrollArea and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const opened = await openFixture(page, 'scroll-area', scenario, reference);
	return {
		root: page.getByTestId('root'),
		viewport: page.getByTestId('viewport'),
		corner: page.getByTestId('corner'),
		scrollbarY: page.getByTestId('scrollbar-y'),
		errors: opened.errors
	};
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('overflowing content shows both scrollbars and the corner', async ({ page }) => {
			const { root, viewport, corner, scrollbarY, errors } = await open(page, 'both', reference);
			await expect(root).toHaveAttribute('data-has-overflow-x', '');
			await expect(root).toHaveAttribute('data-has-overflow-y', '');
			await expect(viewport).toHaveAttribute('tabindex', '0');
			await expect(viewport).toHaveClass(/base-ui-disable-scrollbar/);
			await expect(scrollbarY).toHaveAttribute('aria-hidden', 'true');
			await expect(scrollbarY).toHaveAttribute('data-orientation', 'vertical');
			await expect(corner).toBeAttached();
			expect(errors).toEqual([]);
		});

		test('content that fits leaves the viewport out of tab order', async ({ page }) => {
			const { root, viewport, scrollbarY, corner } = await open(page, 'none', reference);
			await expect(viewport).toHaveAttribute('tabindex', '-1');
			await expect(root).not.toHaveAttribute('data-has-overflow-x');
			await expect(root).not.toHaveAttribute('data-has-overflow-y');
			await expect(scrollbarY).toHaveCount(0);
			await expect(corner).toHaveCount(0);
		});

		test('RTL at the inline start reports overflow on the end edge', async ({ page }) => {
			const { root, viewport } = await open(page, 'rtl', reference);
			await expect(root).toHaveAttribute('data-has-overflow-x', '');
			await expect(root).toHaveAttribute('data-overflow-x-end', '');
			await expect(root).not.toHaveAttribute('data-overflow-x-start');
			await viewport.evaluate((element) => {
				element.scrollLeft = 0;
			});
			await expect(root).toHaveAttribute('data-overflow-x-end', '');
			await expect(root).not.toHaveAttribute('data-overflow-x-start');
		});
	});
}

test('svelte SSR renders the viewport before overflow is measured', async ({ request }) => {
	const html = await (await request.get('/fixtures/scroll-area?case=both')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="presentation"');
	expect(html).toContain('base-ui-disable-scrollbar');
	expect(html).toContain('tabindex="-1"');
	expect(html).toContain('-viewport');
	expect(html).not.toContain('data-has-overflow-y');
});
