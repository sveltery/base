// Each case runs against the Svelte Popover and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/popover?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return {
		trigger: page.getByRole('button', { name: 'Open' }),
		popup: page.getByRole('dialog'),
		outside: page.getByRole('button', { name: 'Outside' }),
		errors
	};
}

async function recorded(page: Page) {
	const text = await page.getByTestId('calls').innerText();
	return JSON.parse(text) as Array<{ open: boolean; reason: string; canceled: boolean }>;
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('click opens and closes the popover', async ({ page }) => {
			const { trigger, popup, errors } = await open(page, 'standalone', reference);
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
			await expect(popup).toHaveCount(0);

			await trigger.click();
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect(trigger).toHaveAttribute('data-popup-open', '');
			await expect(trigger).toHaveAttribute('data-pressed', '');
			await expect(popup).toHaveAttribute('data-open', '');
			await expect(popup).toHaveText(/Content/);
			expect(await recorded(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false }
			]);

			await trigger.click();
			await expect(popup).toHaveCount(0);
			expect(errors).toEqual([]);
		});

		test('escape and an outside click close the popover', async ({ page }) => {
			const { trigger, popup, outside } = await open(page, 'standalone', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			await page.keyboard.press('Escape');
			await expect(popup).toHaveCount(0);
			expect(await recorded(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: false },
				{ open: false, reason: 'escape-key', canceled: false }
			]);

			await trigger.click();
			await outside.click();
			await expect(popup).toHaveCount(0);
		});

		test('an outside click leaves focus on the clicked button', async ({ page }) => {
			const { trigger, popup, outside } = await open(page, 'standalone', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			await outside.click();
			await expect(popup).toHaveCount(0);
			await expect(outside).toBeFocused();
		});

		test('typing into an outside input keeps the text', async ({ page }) => {
			const { trigger, popup } = await open(page, 'standalone', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			const input = page.getByTestId('outside-input');
			await input.click();
			await page.keyboard.type('kept');
			await expect(popup).toHaveCount(0);
			await expect(input).toBeFocused();
			await expect(input).toHaveValue('kept');
		});

		test('canceling onOpenChange keeps the popover closed', async ({ page }) => {
			const { trigger, popup } = await open(page, 'cancel', reference);
			await trigger.click();
			await expect(popup).toHaveCount(0);
			expect(await recorded(page)).toEqual([
				{ open: true, reason: 'trigger-press', canceled: true }
			]);
		});

		test('a disabled trigger does not open', async ({ page }) => {
			const { trigger, popup } = await open(page, 'disabled', reference);
			await expect(trigger).toBeDisabled();
			await trigger.click({ force: true });
			await expect(popup).toHaveCount(0);
			expect(await recorded(page)).toEqual([]);
		});

		test('consumer click can skip the trigger handler', async ({ page }) => {
			const { trigger, popup } = await open(page, 'prevented', reference);
			await trigger.click();
			await expect(popup).toHaveCount(0);
			expect(await recorded(page)).toEqual([]);
		});

		test('hover opens the popover and an outside hover closes it', async ({ page }) => {
			const { trigger, popup, outside } = await open(page, 'hover', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();
			await expect(trigger).not.toHaveAttribute('data-pressed');
			await outside.hover();
			await expect(popup).toHaveCount(0);
		});

		test('modal renders a backdrop and the close button dismisses', async ({ page }) => {
			const { trigger, popup } = await open(page, 'modal', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			await expect(page.locator('[role="presentation"]:not([data-side])')).not.toHaveCount(0);
			await page.getByRole('button', { name: 'Close' }).click();
			await expect(popup).toHaveCount(0);
		});

		test('an initially open popover is visible', async ({ page }) => {
			const { trigger, popup } = await open(page, 'open', reference);
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
			await expect(popup).toBeVisible();
			await trigger.click();
			await expect(popup).toHaveCount(0);
		});

		for (const step of [
			{ key: 'Tab' as const, name: 'After', shift: false },
			{ key: 'Shift+Tab' as const, name: 'Before', shift: true }
		]) {
			test(`leaving a non-modal popover with ${step.key} focuses ${step.name}`, async ({
				page
			}) => {
				const { trigger, popup } = await open(page, 'tab', reference);
				await trigger.click();
				await expect(popup.getByRole('button', { name: 'Inside' })).toBeFocused();
				if (step.shift) await trigger.focus();
				await page.keyboard.press(step.key);
				await expect(page.getByRole('button', { name: step.name })).toBeFocused();
				await expect(popup).toHaveCount(0);
				if (!step.shift) {
					expect(await recorded(page)).toEqual([
						{ open: true, reason: 'trigger-press', canceled: false },
						{ open: false, reason: 'focus-out', canceled: false }
					]);
				}
			});
		}

		for (const scenario of ['tab', 'tab-inline'] as const) {
			test(`shift-tab from the first control focuses the trigger (${scenario})`, async ({
				page
			}) => {
				const { trigger, popup } = await open(page, scenario, reference);
				await trigger.click();
				await expect(popup.getByRole('button', { name: 'Inside' })).toBeFocused();
				if (scenario === 'tab-inline') {
					await expect(
						popup.locator('xpath=ancestor::*[@data-testid="inline-container"]')
					).toHaveCount(1);
				}
				await page.keyboard.press('Shift+Tab');
				await expect(trigger).toBeFocused();
				await expect(popup).toBeVisible();
			});

			test(`tab from the open trigger enters the popup (${scenario})`, async ({ page }) => {
				const { trigger, popup } = await open(page, scenario, reference);
				await trigger.click();
				await expect(popup.getByRole('button', { name: 'Inside' })).toBeFocused();
				await trigger.focus();
				await page.keyboard.press('Tab');
				await expect(popup.getByRole('button', { name: 'Inside' })).toBeFocused();
				await expect(popup).toBeVisible();
			});
		}

		test('tab from a popup with no tabbable control closes onto After', async ({ page }) => {
			const { trigger, popup } = await open(page, 'tab-empty', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			await trigger.focus();
			await page.keyboard.press('Tab');
			await expect(page.getByTestId('after')).toBeFocused();
			await expect(popup).toHaveCount(0);
		});

		test('tab from a hover-opened trigger stays on the guard', async ({ page }) => {
			const { trigger, popup } = await open(page, 'hover', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();
			await trigger.focus();
			await page.keyboard.press('Tab');
			await expect(page.locator(':focus')).toHaveAttribute('data-base-ui-focus-guard', '');
			await expect(popup).toBeVisible();
		});

		test('a trailing guard reached from outside focuses inside and stays open', async ({
			page
		}) => {
			const { popup } = await open(page, 'tab', reference);
			await page.getByRole('button', { name: 'Open' }).click();
			await expect(popup.getByRole('button', { name: 'Inside' })).toBeFocused();
			await page.evaluate(() => {
				const popupNode = document.querySelector('[role="dialog"]');
				const guard = [...document.querySelectorAll('[data-base-ui-focus-guard]')].find(
					(node) =>
						popupNode?.parentElement?.contains(node) &&
						Boolean(popupNode.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING)
				);
				if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
				if (guard instanceof HTMLElement) guard.focus();
			});
			await expect(popup.getByRole('button', { name: 'Inside' })).toBeFocused();
			await expect(popup).toBeVisible();
		});

		test('a detached trigger opens the popover', async ({ page }) => {
			const { trigger, popup } = await open(page, 'detached', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			await expect(popup).toHaveText(/Content/);
		});
	});
}

test('svelte SSR renders a closed trigger before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/popover?case=standalone')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('aria-expanded="false"');
	expect(html).toContain('aria-haspopup="dialog"');
	expect(html).not.toContain('>Content<');
});

test('svelte SSR omits an open popover before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/popover?case=open')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('aria-expanded="false"');
	expect(html).not.toContain('aria-controls');
	expect(html).not.toContain('role="dialog"');
	expect(html).not.toContain('data-base-ui-portal');
	expect(html).not.toContain('>Content<');
});
