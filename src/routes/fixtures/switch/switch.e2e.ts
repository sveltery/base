// Each case runs against the Svelte Switch and the React Base UI 1.9.0 reference.
// Sveltery renders a real input over the box, so the checks read the checked state and the
// box's data attributes, which sit on the input's parent in Svelte.
import { expect, test, type Page } from '@playwright/test';
import { forEachFramework } from '../framework-loop.js';
import { openFixture } from '../open-fixture.js';
import { expectOwnerCleared } from '../owner-checked.js';
import { readChecked, readValues } from '../read-output.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const opened = await openFixture(page, 'switch', scenario, reference);
	const control = page.getByRole('switch', { name: 'Notifications' });
	return {
		switchEl: control,
		box: reference ? control : control.locator('..'),
		errors: opened.errors
	};
}

forEachFramework((reference, framework) => {
	test.describe(framework, () => {
		test('click toggles the checked state and data-checked', async ({ page }) => {
			const { switchEl, box, errors } = await open(page, 'standalone', reference);
			await expect(switchEl).not.toBeChecked();
			await expect(box).toHaveAttribute('data-unchecked', '');
			await switchEl.click();
			await expect(switchEl).toBeChecked();
			await expect(box).toHaveAttribute('data-checked', '');
			expect(await readChecked(page)).toEqual([{ checked: true, reason: 'none', canceled: false }]);
			await switchEl.click();
			await expect(switchEl).not.toBeChecked();
			expect(await readChecked(page)).toHaveLength(2);
			expect(errors).toEqual([]);
		});

		// Sveltery: a native checkbox input toggles on Space only. Enter is left to the form.
		test('keyboard Space activates the switch, and Enter does in Base UI', async ({ page }) => {
			const { switchEl } = await open(page, 'standalone', reference);
			await switchEl.focus();
			await page.keyboard.press('Space');
			await expect(switchEl).toBeChecked();
			await page.keyboard.press('Enter');
			if (reference) await expect(switchEl).not.toBeChecked();
			else await expect(switchEl).toBeChecked();
		});

		test('owner-held state follows the owner and receives clicks', async ({ page }) => {
			const { switchEl } = await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });
			await expect(switchEl).not.toBeChecked();
			await owner.check();
			await expect(switchEl).toBeChecked();
			await switchEl.click();
			await expectOwnerCleared(page, switchEl);
		});

		test('canceling onCheckedChange keeps the state', async ({ page }) => {
			const { switchEl } = await open(page, 'cancel', reference);
			await switchEl.click();
			await expect(switchEl).not.toBeChecked();
			expect(await readChecked(page)).toEqual([{ checked: true, reason: 'none', canceled: true }]);
		});

		test('disabled never calls back', async ({ page }) => {
			const { switchEl, box } = await open(page, 'disabled', reference);
			await expect(switchEl).toBeDisabled();
			await expect(box).toHaveAttribute('data-disabled', '');
			await switchEl.click({ force: true });
			await expect(switchEl).not.toBeChecked();
			expect(await readChecked(page)).toEqual([]);
		});

		test('readOnly does not toggle', async ({ page }) => {
			const { switchEl, box } = await open(page, 'readonly', reference);
			await expect(switchEl).toHaveAttribute('aria-readonly', 'true');
			await expect(box).toHaveAttribute('data-readonly', '');
			await switchEl.click();
			await expect(switchEl).not.toBeChecked();
			expect(await readChecked(page)).toEqual([]);
		});

		test('a wrapping label toggles the switch once', async ({ page }) => {
			const { switchEl } = await open(page, 'label', reference);
			await page.getByText('Toggle').click();
			await expect(switchEl).toBeChecked();
			expect(await readChecked(page)).toEqual([{ checked: true, reason: 'none', canceled: false }]);
		});

		test('form submission cycles uncheckedValue and value', async ({ page }) => {
			const { switchEl } = await open(page, 'form', reference);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => readValues(page)).toEqual(['no']);
			await switchEl.click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => readValues(page)).toEqual(['no', 'yes']);
			await switchEl.click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => readValues(page)).toEqual(['no', 'yes', 'no']);
		});

		test('native button keeps the id and activates from the keyboard', async ({ page }) => {
			test.skip(!reference, 'Sveltery renders a real input, with no native button host');
			const { switchEl } = await open(page, 'native', reference);
			await expect(switchEl).toHaveAttribute('id', 'tested-switch');
			expect(await switchEl.evaluate((element) => element.tagName)).toBe('BUTTON');
			await switchEl.focus();
			await page.keyboard.press('Enter');
			await expect(switchEl).toBeChecked();
			await page.keyboard.press('Space');
			await expect(switchEl).not.toBeChecked();
		});

		// Svelte calls event.preventDefault(); React calls event.preventBaseUIHandler().
		test('consumer onclick can skip the switch handler', async ({ page }) => {
			const { switchEl } = await open(page, 'prevented', reference);
			await switchEl.click();
			await expect(switchEl).not.toBeChecked();
			expect(await readChecked(page)).toEqual([]);
		});
	});
});

test('svelte SSR renders an unchecked switch before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/switch?case=standalone')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="switch"');
	expect(html).toContain('data-unchecked');
	expect(html).toContain('type="checkbox"');
});
