import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/overlay-foundation?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return {
		trigger: page.getByRole('button', { name: 'Open' }),
		popup: page.getByRole('dialog', { name: 'Notice' }),
		inside: page.getByRole('button', { name: 'Inside' }),
		outside: page.getByTestId('outside'),
		errors
	};
}

async function calls(page: Page) {
	return JSON.parse(await page.getByTestId('calls').innerText()) as {
		open: boolean;
		reason: string;
		canceled: boolean;
	}[];
}

async function scrollLocked(page: Page) {
	return page.evaluate(() => {
		const html = document.documentElement.style.overflowY;
		const body = document.body.style.overflowY;
		return html === 'hidden' || body === 'hidden';
	});
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('click opens a portaled popup and locks scroll while it is modal', async ({ page }) => {
			const { trigger, popup, inside, errors } = await open(page, 'modal', reference);
			await trigger.click();
			await expect(popup).toHaveAttribute('data-open', '');
			await expect(popup).not.toHaveCount(0);
			await expect(page.getByTestId('anchor').locator('[data-testid="popup"]')).toHaveCount(0);
			await expect(inside).toBeFocused();
			await expect.poll(() => scrollLocked(page)).toBe(true);
			expect(errors).toEqual([]);
		});

		test('Escape closes the popup and returns focus', async ({ page }) => {
			const { trigger, popup, inside } = await open(page, 'modal', reference);
			await trigger.click();
			await expect(inside).toBeFocused();
			await page.keyboard.press('Escape');
			await expect(popup).toHaveCount(0);
			await expect(trigger).toBeFocused();
			expect(await calls(page)).toContainEqual({
				open: false,
				reason: 'escape-key',
				canceled: false
			});
		});

		test('clicking the trigger again closes the popup', async ({ page }) => {
			const { trigger, popup } = await open(page, 'modal', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			await page.getByRole('button', { name: 'Open', includeHidden: true }).click({ force: true });
			await expect(popup).toHaveCount(0);
		});

		test('an outside press closes a modeless popup', async ({ page }) => {
			const { trigger, popup, outside } = await open(page, 'modeless', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			await outside.click();
			await expect(popup).toHaveCount(0);
			expect(await calls(page)).toContainEqual({
				open: false,
				reason: 'outside-press',
				canceled: false
			});
		});

		test('canceling the open change leaves the popup closed', async ({ page }) => {
			const { trigger, popup } = await open(page, 'cancel', reference);
			await trigger.click();
			await expect(popup).toHaveCount(0);
			expect(await calls(page)).toEqual([{ open: true, reason: 'trigger-press', canceled: true }]);
		});
	});
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(`${framework} anchored`, () => {
		test('a pointer open places the popup under the trigger and locks scroll', async ({ page }) => {
			const { trigger, popup, errors } = await open(page, 'placed', reference);
			await trigger.click();
			await expect(popup).toBeVisible();
			const positioner = page.getByTestId('positioner');
			await expect
				.poll(async () => {
					const triggerBox = await trigger.boundingBox();
					const popupBox = await popup.boundingBox();
					if (!triggerBox || !popupBox) return false;
					return (
						popupBox.y >= triggerBox.y + triggerBox.height - 1 && popupBox.x >= triggerBox.x - 1
					);
				})
				.toBe(true);
			await expect(positioner).toHaveAttribute('data-side', 'bottom');
			await expect.poll(() => scrollLocked(page)).toBe(true);
			expect(errors).toEqual([]);
		});

		test('hover opens the popup, keeps it open across the safe area, and does not lock scroll', async ({
			page
		}) => {
			const { trigger, popup, outside } = await open(page, 'hover', reference);
			await trigger.hover();
			await expect(popup).toBeVisible();
			await expect.poll(() => scrollLocked(page)).toBe(false);
			await popup.hover();
			await expect(popup).toBeVisible();
			await outside.hover();
			await expect(popup).toHaveCount(0);
		});
	});
}

test('a canceled preventUnmountOnClose keeps the next close mounted', async ({ page }) => {
	const { trigger, popup } = await open(page, 'stuck', false);
	await trigger.click();
	await expect(popup).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(popup).toBeVisible();
	await expect(page.getByTestId('anchor')).toHaveAttribute('data-prevent-unmount', '');
	await page.keyboard.press('Escape');
	await expect(page.getByTestId('popup')).toHaveAttribute('data-closed', '');
	await expect(page.getByTestId('popup')).toHaveCount(1);
});
