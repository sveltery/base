// Each case runs against the Svelte Toast and the React Base UI 1.8.0 reference.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';
import { readOutput } from '../read-output.js';

function openToast(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'toast', scenario, reference);
}

const press = (page: Page, testId: string) => page.getByTestId(testId).click();
const toastByTitle = (page: Page, title: string) =>
	page
		.getByTestId('toast')
		.filter({ has: page.getByTestId('title').getByText(title, { exact: true }) });

/** Hovering the newest toast expands the stack, so older toasts no longer sit under it. */
async function expandStack(page: Page) {
	await page.getByTestId('toast').first().hover();
	await expect(page.getByTestId('viewport')).toHaveAttribute('data-expanded', '');
}

const readLog = (page: Page) => readOutput<string[]>(page, 'log');

function cssVar(locator: Locator, name: string) {
	return locator.evaluate((element, variable) => element.style.getPropertyValue(variable), name);
}

async function cssNumber(locator: Locator, name: string) {
	return Number.parseFloat(await cssVar(locator, name));
}

/** Presses the pointer inside the toast's padding, away from its buttons, and returns the start. */
async function pressToast(page: Page, toast: Locator) {
	const box = (await toast.boundingBox())!;
	const start = { x: box.x + 4, y: box.y + 4 };
	await page.mouse.move(start.x, start.y);
	await page.mouse.down();
	return start;
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('a toast added through the manager is labelled and described', async ({ page }) => {
			const { errors } = await openToast(page, 'basic', reference);
			const viewport = page.getByRole('region', { name: 'Notifications' });
			await expect(viewport).toHaveAttribute('aria-live', 'polite');
			await expect(viewport).toHaveAttribute('aria-relevant', 'additions text');
			await expect(page.getByTestId('toast')).toHaveCount(0);

			await press(page, 'add');
			const toast = page.getByRole('dialog', { name: 'Toast 1' });
			await expect(toast).toHaveCount(1);
			await expect(toast).toHaveAttribute('aria-modal', 'false');
			await expect(toast).toHaveAttribute('tabindex', '0');
			await expect(toast).not.toHaveAttribute('data-starting-style');
			await expect(toast.getByRole('heading', { name: 'Toast 1' })).toBeVisible();
			await expect(toast).toHaveAccessibleDescription('Description 1');
			await expect(page.getByTestId('action')).toHaveCount(0);
			// The close button is hidden from assistive technology until the viewport expands.
			await expect(page.getByTestId('close')).toHaveAttribute('aria-hidden', 'true');
			expect(errors).toEqual([]);
		});

		test('a toast added through createToastManager outside the tree renders and closes', async ({
			page
		}) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add-global');
			await expect(toastByTitle(page, 'Global 1')).toHaveCount(1);
			await press(page, 'add');
			await expect(page.getByTestId('toast')).toHaveCount(2);

			await press(page, 'close-global');
			await expect(page.getByTestId('toast')).toHaveCount(0);
			expect(await readLog(page)).toEqual(['close:Toast 2', 'close:Global 1', 'remove:Toast 2']);
		});

		test('a toast closes itself after the timeout', async ({ page }) => {
			await openToast(page, 'timeout', reference);
			await press(page, 'add');
			await expect(page.getByTestId('toast')).toHaveCount(1);
			await expect(page.getByTestId('toast')).toHaveCount(0);
			expect(await readLog(page)).toEqual(['close:Toast 1', 'remove:Toast 1']);
		});

		test('hovering the viewport pauses the timer and leaving resumes it', async ({ page }) => {
			await openToast(page, 'timeout', reference);
			await press(page, 'add');
			const toast = page.getByTestId('toast');
			const viewport = page.getByTestId('viewport');
			await expect(viewport).not.toHaveAttribute('data-expanded');
			await toast.hover();
			await expect(viewport).toHaveAttribute('data-expanded', '');
			await expect(toast).toHaveAttribute('data-expanded', '');
			await expect(page.getByTestId('close')).toHaveAttribute('aria-hidden', 'false');

			await page.waitForTimeout(1800);
			await expect(toast).toHaveCount(1);
			expect(await readLog(page)).toEqual([]);

			await page.mouse.move(1, 1);
			await expect(viewport).not.toHaveAttribute('data-expanded');
			await expect(toast).toHaveCount(0);
			expect(await readLog(page)).toEqual(['close:Toast 1', 'remove:Toast 1']);
		});

		test('F6 focuses the viewport and Shift+Tab returns focus', async ({ page }) => {
			await openToast(page, 'timeout', reference);
			await press(page, 'add');
			await page.getByTestId('add').focus();
			const viewport = page.getByTestId('viewport');

			await page.keyboard.press('F6');
			await expect(viewport).toBeFocused();
			await expect(viewport).toHaveAttribute('data-expanded', '');

			// Focus holds the timer past the toast's timeout.
			await page.waitForTimeout(1500);
			await expect(page.getByTestId('toast')).toHaveCount(1);

			await page.keyboard.press('Shift+Tab');
			await expect(page.getByTestId('add')).toBeFocused();
			await expect(viewport).not.toHaveAttribute('data-expanded');
			await expect(page.getByTestId('toast')).toHaveCount(0);
		});

		test('Escape closes the focused toast and focus moves on', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add');
			await press(page, 'add');
			await expect(page.getByTestId('toast')).toHaveCount(2);
			await page.getByTestId('add').focus();

			await page.keyboard.press('F6');
			await page.keyboard.press('Tab');
			await expect(toastByTitle(page, 'Toast 2')).toBeFocused();

			await page.keyboard.press('Escape');
			await expect(toastByTitle(page, 'Toast 2')).toHaveCount(0);
			await expect(toastByTitle(page, 'Toast 1')).toBeFocused();

			await page.keyboard.press('Escape');
			await expect(page.getByTestId('toast')).toHaveCount(0);
			await expect(page.getByTestId('add')).toBeFocused();
			expect(await readLog(page)).toEqual([
				'close:Toast 2',
				'remove:Toast 2',
				'close:Toast 1',
				'remove:Toast 1'
			]);
		});

		test('the close button closes its toast', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add');
			await press(page, 'add');
			await expandStack(page);
			await toastByTitle(page, 'Toast 1').getByTestId('close').click();
			await expect(toastByTitle(page, 'Toast 1')).toHaveCount(0);
			await expect(toastByTitle(page, 'Toast 2')).toHaveCount(1);
			expect(await readLog(page)).toEqual(['close:Toast 1', 'remove:Toast 1']);
		});

		test('the action button runs its handler and leaves the toast open', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add-action');
			const action = page.getByRole('button', { name: 'Undo' });
			await expect(action).toHaveAttribute('type', 'button');
			await action.click();
			expect(await readLog(page)).toEqual(['action:Toast 1']);
			await expect(page.getByTestId('toast')).toHaveCount(1);
		});

		test('the toast over the limit is marked data-limited', async ({ page }) => {
			await openToast(page, 'limit', reference);
			await press(page, 'add');
			await press(page, 'add');
			await press(page, 'add');
			const toasts = page.getByTestId('toast');
			await expect(toasts).toHaveCount(3);
			// The newest toast comes first.
			await expect(toasts.nth(0)).not.toHaveAttribute('data-limited');
			await expect(toasts.nth(1)).not.toHaveAttribute('data-limited');
			await expect(toasts.nth(2)).toHaveAttribute('data-limited', '');
			await expect(toasts.nth(2)).toHaveJSProperty('inert', true);
			await expect(toastByTitle(page, 'Toast 1')).toHaveAttribute('data-limited', '');

			await toastByTitle(page, 'Toast 3').getByTestId('close').click();
			await expect(toastByTitle(page, 'Toast 3')).toHaveCount(0);
			await expect(toastByTitle(page, 'Toast 1')).not.toHaveAttribute('data-limited');
		});

		test('update changes the toast in place', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add');
			await expect(page.getByTestId('toast')).not.toHaveAttribute('data-type');
			await press(page, 'update');
			const toast = page.getByTestId('toast');
			await expect(toast).toHaveCount(1);
			await expect(toast).toHaveAttribute('data-type', 'info');
			await expect(page.getByTestId('title')).toHaveText('Updated');
			await expect(page.getByTestId('title')).toHaveAttribute('data-type', 'info');
			await expect(page.getByTestId('description')).toHaveText('Updated description');
			expect(await readLog(page)).toEqual([]);
		});

		test('a promise toast goes from loading to success', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'promise');
			const toast = page.getByTestId('toast');
			await expect(toast).toHaveAttribute('data-type', 'loading');
			await expect(page.getByTestId('title')).toHaveText('Saving');
			await expect(page.getByTestId('description')).toHaveText('Please wait');

			await press(page, 'resolve');
			await expect(toast).toHaveAttribute('data-type', 'success');
			await expect(page.getByTestId('title')).toHaveText('Saved');
			await expect(page.getByTestId('description')).toHaveText('All good');
			await expect(toast).toHaveCount(1);
		});

		test('a promise toast goes from loading to error', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'promise');
			await expect(page.getByTestId('toast')).toHaveAttribute('data-type', 'loading');
			await press(page, 'reject');
			await expect(page.getByTestId('toast')).toHaveAttribute('data-type', 'error');
			await expect(page.getByTestId('title')).toHaveText('Failed');
			await expect(page.getByTestId('description')).toHaveText('Went wrong');
		});

		test('a loading toast ignores the timeout and the settled toast starts it', async ({
			page
		}) => {
			await openToast(page, 'timeout', reference);
			await press(page, 'promise');
			await page.waitForTimeout(1500);
			await expect(page.getByTestId('toast')).toHaveAttribute('data-type', 'loading');

			await press(page, 'resolve');
			await expect(page.getByTestId('title')).toHaveText('Saved');
			await expect(page.getByTestId('toast')).toHaveCount(0);
		});

		test('a high priority toast is mirrored in a role=alert region', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add');
			await expect(page.getByRole('alert')).toHaveCount(0);
			await expect(toastByTitle(page, 'Toast 1')).toHaveAttribute('role', 'dialog');
			await expect(toastByTitle(page, 'Toast 1')).not.toHaveAttribute('aria-hidden');

			await press(page, 'add-high');
			const urgent = toastByTitle(page, 'Urgent 2');
			await expect(urgent).toHaveAttribute('role', 'alertdialog');
			await expect(urgent).toHaveAttribute('aria-hidden', 'true');
			const alert = page.getByRole('alert');
			await expect(alert).toHaveCount(1);
			await expect(alert).toContainText('Urgent 2');
			await expect(alert).toContainText('Description 2');

			// Focusing the viewport exposes the toast itself, so the mirror goes away.
			await page.keyboard.press('F6');
			await expect(page.getByTestId('viewport')).toBeFocused();
			await expect(page.getByRole('alert')).toHaveCount(0);
			await expect(urgent).not.toHaveAttribute('aria-hidden');
		});

		test('dragging a toast down with the mouse dismisses it', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add');
			const toast = page.getByTestId('toast');
			await expect(toast).not.toHaveAttribute('data-starting-style');
			const start = await pressToast(page, toast);

			await page.mouse.move(start.x, start.y + 30, { steps: 5 });
			await expect(toast).toHaveAttribute('data-swiping', '');
			await expect(toast).toHaveAttribute('data-swipe-direction', 'down');
			expect(await cssNumber(toast, '--toast-swipe-movement-y')).toBeGreaterThan(20);
			await page.mouse.move(start.x, start.y + 90, { steps: 5 });
			await page.mouse.up();

			await expect(toast).toHaveCount(0);
			expect(await readLog(page)).toEqual(['close:Toast 1', 'remove:Toast 1']);
		});

		test('dragging a toast right with the mouse dismisses it', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add');
			const toast = page.getByTestId('toast');
			await expect(toast).not.toHaveAttribute('data-starting-style');
			const start = await pressToast(page, toast);

			await page.mouse.move(start.x + 100, start.y, { steps: 8 });
			await expect(toast).toHaveAttribute('data-swipe-direction', 'right');
			expect(await cssNumber(toast, '--toast-swipe-movement-x')).toBeGreaterThan(40);
			await page.mouse.up();

			await expect(toast).toHaveCount(0);
			expect(await readLog(page)).toEqual(['close:Toast 1', 'remove:Toast 1']);
		});

		test('a short drag snaps the toast back', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add');
			const toast = page.getByTestId('toast');
			await expect(toast).not.toHaveAttribute('data-starting-style');
			const start = await pressToast(page, toast);

			await page.mouse.move(start.x, start.y + 20, { steps: 4 });
			await expect(toast).toHaveAttribute('data-swiping', '');
			await page.mouse.up();

			await expect(toast).not.toHaveAttribute('data-swiping');
			await expect(toast).not.toHaveAttribute('data-swipe-direction');
			await expect.poll(() => cssVar(toast, '--toast-swipe-movement-y')).toBe('0px');
			await expect(toast).toHaveCount(1);
			expect(await readLog(page)).toEqual([]);
		});

		test('a drag toward a direction that is not swipeable keeps the toast', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add');
			const toast = page.getByTestId('toast');
			await expect(toast).not.toHaveAttribute('data-starting-style');
			const start = await pressToast(page, toast);

			await page.mouse.move(start.x, start.y - 100, { steps: 8 });
			await page.mouse.up();
			await expect(toast).not.toHaveAttribute('data-swiping');
			await expect(toast).toHaveCount(1);
		});

		test('an anchored toast sits against its anchor with an arrow', async ({ page }) => {
			await openToast(page, 'anchored', reference);
			await press(page, 'add-anchored');
			const positioner = page.getByTestId('positioner');
			const toast = page.getByTestId('toast');
			const arrow = page.getByTestId('arrow');
			await expect(toast).toHaveCount(1);
			await expect(positioner).toHaveAttribute('data-side', 'top');
			await expect(positioner).toHaveAttribute('data-align', 'center');
			await expect(arrow).toHaveAttribute('data-side', 'top');
			await expect(arrow).toHaveAttribute('data-align', 'center');
			await expect(toast).toContainText('Copied 1');

			const anchorBox = (await page.getByTestId('anchor').boundingBox())!;
			await expect
				.poll(async () => {
					const box = (await positioner.boundingBox())!;
					return {
						gap: Math.round(anchorBox.y - (box.y + box.height)),
						offCenter: Math.round(box.x + box.width / 2 - (anchorBox.x + anchorBox.width / 2))
					};
				})
				.toEqual({ gap: 10, offCenter: 0 });

			// Anchored toasts do not swipe.
			const start = await pressToast(page, toast);
			await page.mouse.move(start.x, start.y + 90, { steps: 5 });
			await expect(toast).not.toHaveAttribute('data-swiping');
			await page.mouse.up();
			await expect(toast).toHaveCount(1);
		});

		test('stacked toasts get an index and an offset from the toasts in front', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add');
			await press(page, 'add');
			await press(page, 'add');
			const toasts = page.getByTestId('toast');
			await expect(toasts).toHaveCount(3);
			await expect(toasts.nth(2)).not.toHaveAttribute('data-starting-style');
			await expect(toasts.nth(0)).toContainText('Toast 3');

			const heights = [0, 1, 2].map((index) => cssNumber(toasts.nth(index), '--toast-height'));
			const [first, second] = await Promise.all(heights);
			expect(first).toBeGreaterThan(0);
			expect(second).toBeGreaterThan(0);
			for (const index of [0, 1, 2]) {
				expect(await cssNumber(toasts.nth(index), '--toast-index')).toBe(index);
			}
			expect(await cssVar(toasts.nth(0), '--toast-offset-y')).toBe('0px');
			expect(await cssNumber(toasts.nth(1), '--toast-offset-y')).toBe(first);
			expect(await cssNumber(toasts.nth(2), '--toast-offset-y')).toBe(first + second);
			expect(await cssNumber(page.getByTestId('viewport'), '--toast-frontmost-height')).toBe(first);

			const contents = page.getByTestId('content');
			await expect(contents.nth(0)).not.toHaveAttribute('data-behind');
			await expect(contents.nth(1)).toHaveAttribute('data-behind', '');
			await expect(contents.nth(2)).toHaveAttribute('data-behind', '');

			await toasts.nth(0).hover();
			for (const index of [0, 1, 2]) {
				await expect(toasts.nth(index)).toHaveAttribute('data-expanded', '');
				await expect(contents.nth(index)).toHaveAttribute('data-expanded', '');
			}
		});

		test('closing the newest toast renumbers the stack', async ({ page }) => {
			await openToast(page, 'basic', reference);
			await press(page, 'add');
			await press(page, 'add');
			await toastByTitle(page, 'Toast 2').getByTestId('close').click();
			await expect(page.getByTestId('toast')).toHaveCount(1);
			const toast = toastByTitle(page, 'Toast 1');
			expect(await cssNumber(toast, '--toast-index')).toBe(0);
			expect(await cssVar(toast, '--toast-offset-y')).toBe('0px');
			await expect(page.getByTestId('content')).not.toHaveAttribute('data-behind');
		});
	});
}

// Base UI v1.9.0 fixed the viewport resuming timers that hover or focus still hold. The port
// follows v1.9.0 (docs/upstream-differences.md, "Timers resume while hover or focus still
// holds them"), so these two cases fail on the 1.8.0 React reference: there a mouseleave, or
// focus leaving the viewport, resumes the timers and closes the toast under the other interaction.
test.describe('svelte', () => {
	test('svelte only: a mouseleave keeps timers paused while the viewport holds focus', async ({
		page
	}) => {
		await openToast(page, 'timeout', false);
		await press(page, 'add');
		await page.getByTestId('add').focus();
		await page.keyboard.press('F6');
		const viewport = page.getByTestId('viewport');
		await page.getByTestId('toast').hover();
		await page.mouse.move(1, 1);

		await expect(viewport).toBeFocused();
		await expect(viewport).toHaveAttribute('data-expanded', '');
		await page.waitForTimeout(1800);
		await expect(page.getByTestId('toast')).toHaveCount(1);

		await page.keyboard.press('Shift+Tab');
		await expect(page.getByTestId('toast')).toHaveCount(0);
	});

	test('svelte only: focus leaving the viewport keeps timers paused while the pointer hovers it', async ({
		page
	}) => {
		await openToast(page, 'timeout', false);
		await press(page, 'add');
		await page.getByTestId('add').focus();
		await page.keyboard.press('F6');
		const viewport = page.getByTestId('viewport');
		await page.getByTestId('toast').hover();
		await page.keyboard.press('Shift+Tab');

		await expect(page.getByTestId('add')).toBeFocused();
		await expect(viewport).toHaveAttribute('data-expanded', '');
		await page.waitForTimeout(1800);
		await expect(page.getByTestId('toast')).toHaveCount(1);

		await page.mouse.move(1, 1);
		await expect(page.getByTestId('toast')).toHaveCount(0);
	});
});
