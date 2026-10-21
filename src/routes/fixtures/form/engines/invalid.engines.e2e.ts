// The constraint gate relies on two things every engine must do: cancelling `invalid` hides the
// bubble, and a cancelled `invalid` still blocks the submit.
import { expect, test, type Page } from '@playwright/test';
import { control, debug, error, field, open } from '../shared/helpers.js';

const url = '/fixtures/form/engines';
const send = (page: Page) => page.getByRole('button', { name: 'Send' });

/**
 * Records each `invalid` event and whether it was cancelled. The listener sits on the control,
 * so it runs after the form's capture listener.
 */
async function recordInvalid(page: Page) {
	await page.evaluate(() => {
		const seen: { name: string | null; cancelled: boolean }[] = [];
		(window as unknown as { invalidSeen: typeof seen }).invalidSeen = seen;
		for (const control of document.querySelectorAll<HTMLInputElement>('form [name]')) {
			control.addEventListener('invalid', (event) => {
				seen.push({ name: control.name, cancelled: event.defaultPrevented });
			});
		}
	});
}

const seen = (page: Page) =>
	page.evaluate(
		() =>
			(window as unknown as { invalidSeen: { name: string | null; cancelled: boolean }[] })
				.invalidSeen
	);

test('an invalid submit is blocked and every owned control cancels its bubble', async ({
	page
}) => {
	await open(page, url);
	await recordInvalid(page);
	await send(page).click();

	await expect(error(page, 'email')).toBeVisible();
	await expect(error(page, 'terms')).toBeVisible();
	await expect(error(page, 'fruit')).toBeVisible();
	await expect(control(page, 'email')).toBeFocused();
	expect((await debug(page)).submitted).toBe(0);

	const events = await seen(page);
	expect(events.length).toBeGreaterThanOrEqual(3);
	expect(events).toEqual(events.map((event) => ({ ...event, cancelled: true })));
	for (const name of ['email', 'terms', 'fruit']) {
		await expect(field(page, name)).toHaveAttribute('data-invalid', '');
	}
});

test('a control outside any Field keeps the browser bubble', async ({ page }) => {
	await open(page, url);
	await control(page, 'email').fill('ada@example.com');
	await page.getByTestId('terms').click();
	await page.getByTestId('fruit').click();
	await page.getByRole('option', { name: 'Pear' }).click();
	await page.getByTestId('loose').evaluate((input: HTMLInputElement) => {
		input.required = true;
	});
	await recordInvalid(page);
	await send(page).click();

	await expect.poll(() => seen(page)).toEqual([{ name: 'loose', cancelled: false }]);
	expect((await debug(page)).submitted).toBe(0);
});

test('a valid form submits', async ({ page }) => {
	await open(page, url);
	await control(page, 'email').fill('ada@example.com');
	await page.getByTestId('terms').click();
	await page.getByTestId('fruit').click();
	await page.getByRole('option', { name: 'Pear' }).click();
	await send(page).click();
	await expect.poll(async () => (await debug(page)).submitted).toBe(1);
});
