import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const opened = await openFixture(page, 'message-scroller', scenario, reference);
	const viewport = page.getByTestId('viewport');
	return {
		root: page.getByTestId('root'),
		viewport,
		content: page.getByTestId('content'),
		start: page.getByTestId('start'),
		end: page.getByTestId('end'),
		scrollTop: () => viewport.evaluate((element) => element.scrollTop),
		offsetInViewport: (id: string) =>
			page.evaluate((messageId) => {
				const viewport = document.querySelector('[data-testid=viewport]')!;
				const item = document.querySelector(`[data-message-id="${messageId}"]`)!;
				return item.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
			}, id),
		errors: opened.errors
	};
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('labels the viewport and the log and opens at the end', async ({ page }) => {
			const { root, viewport, content, start, end, scrollTop, errors } = await open(
				page,
				'end',
				reference
			);
			await expect(viewport).toHaveAttribute('role', 'region');
			await expect(viewport).toHaveAttribute('aria-label', 'Messages');
			await expect(viewport).toHaveAttribute('tabindex', '0');
			await expect(content).toHaveAttribute('role', 'log');
			await expect(content).toHaveAttribute('aria-relevant', 'additions');
			await expect(content.locator('[data-message-scroller-spacer]')).toBeHidden();
			await expect.poll(scrollTop).toBe(140);
			await expect(root).toHaveAttribute('data-scrollable', 'start');
			await expect(viewport).toHaveAttribute('data-scrollable', 'start');
			await expect(root).not.toHaveAttribute('data-pending-scroll');
			await expect(viewport).not.toHaveAttribute('data-pending-scroll');
			await expect(end).toHaveAttribute('data-active', 'false');
			await expect(end).toHaveAttribute('inert', '');
			await expect(end).toHaveAttribute('tabindex', '-1');
			await expect(start).toHaveAttribute('data-active', 'true');
			await expect(start).toHaveText('Scroll to start');
			expect(errors).toEqual([]);
		});

		test('opens at the start and the end button scrolls to the end', async ({ page }) => {
			const { root, start, end, scrollTop } = await open(page, 'start', reference);
			await expect(root).toHaveAttribute('data-scrollable', 'end');
			expect(await scrollTop()).toBe(0);
			await expect(start).toHaveAttribute('data-active', 'false');
			await end.click();
			await expect.poll(scrollTop).toBe(140);
			await expect(root).toHaveAttribute('data-scrollable', 'start');
			await expect(end).toHaveAttribute('data-active', 'false');
		});

		test('opens "last-anchor" with the last anchor at the reading line', async ({ page }) => {
			const { root, scrollTop, offsetInViewport } = await open(page, 'last-anchor', reference);
			await expect.poll(scrollTop).toBe(36);
			expect(await offsetInViewport('message-2')).toBe(64);
			await expect(root).toHaveAttribute('data-scrollable', 'start end');
		});

		test('anchors an appended turn below the previous row while autoScroll is on', async ({
			page
		}) => {
			const { scrollTop, offsetInViewport } = await open(page, 'auto-scroll', reference);
			await expect.poll(scrollTop).toBe(140);
			await page.getByRole('button', { name: 'Append' }).click();
			await expect.poll(() => offsetInViewport('message-4')).toBe(64);
			expect(await scrollTop()).toBe(176);
		});

		test('an empty transcript drops data-pending-scroll and has no scrollable edge', async ({
			page
		}) => {
			const { root, viewport, start, end } = await open(page, 'empty', reference);
			await expect(viewport).not.toHaveAttribute('data-pending-scroll');
			await expect(root).not.toHaveAttribute('data-scrollable');
			await expect(start).toHaveAttribute('data-active', 'false');
			await expect(end).toHaveAttribute('data-active', 'false');
		});
	});
}

test('svelte SSR marks the opening scroll as pending', async ({ request }) => {
	const html = await (await request.get('/fixtures/message-scroller?case=end')).text();
	expect(html.match(/data-pending-scroll=""/g)).toHaveLength(2);
	expect(html).toContain('data-message-id="message-3"');
	expect(html).toContain('data-scroll-anchor="false"');
});

test('svelte SSR opening at the start has nothing pending', async ({ request }) => {
	const html = await (await request.get('/fixtures/message-scroller?case=start')).text();
	expect(html).not.toContain('data-pending-scroll');
});
