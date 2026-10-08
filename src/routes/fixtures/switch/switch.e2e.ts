// Each case runs against the Svelte Switch and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { forEachFramework } from '../framework-loop.js';
import { openFixture } from '../open-fixture.js';
import { expectOwnerCleared } from '../owner-checked.js';
import { readChecked, readValues } from '../read-output.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const opened = await openFixture(page, 'switch', scenario, reference);
	return { switchEl: page.getByRole('switch', { name: 'Notifications' }), errors: opened.errors };
}

forEachFramework((reference, framework) => {
	test.describe(framework, () => {
		test('click toggles aria-checked and data-checked', async ({ page }) => {
			const { switchEl, errors } = await open(page, 'standalone', reference);
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			await expect(switchEl).toHaveAttribute('data-unchecked', '');
			await switchEl.click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'true');
			await expect(switchEl).toHaveAttribute('data-checked', '');
			expect(await readChecked(page)).toEqual([{ checked: true, reason: 'none', canceled: false }]);
			await switchEl.click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			expect(await readChecked(page)).toHaveLength(2);
			expect(errors).toEqual([]);
		});

		test('keyboard Space and Enter activate the switch', async ({ page }) => {
			const { switchEl } = await open(page, 'standalone', reference);
			await switchEl.focus();
			await page.keyboard.press('Space');
			await expect(switchEl).toHaveAttribute('aria-checked', 'true');
			await page.keyboard.press('Enter');
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
		});

		test('owner-held state follows the owner and receives clicks', async ({ page }) => {
			const { switchEl } = await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			await owner.check();
			await expect(switchEl).toHaveAttribute('aria-checked', 'true');
			await switchEl.click();
			await expectOwnerCleared(page, switchEl);
		});

		test('canceling onCheckedChange keeps the state', async ({ page }) => {
			const { switchEl } = await open(page, 'cancel', reference);
			await switchEl.click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			expect(await readChecked(page)).toEqual([{ checked: true, reason: 'none', canceled: true }]);
		});

		test('disabled uses aria-disabled and never calls back', async ({ page }) => {
			const { switchEl } = await open(page, 'disabled', reference);
			await expect(switchEl).toHaveAttribute('aria-disabled', 'true');
			await expect(switchEl).toHaveAttribute('data-disabled', '');
			await expect(switchEl).not.toHaveAttribute('disabled');
			await switchEl.click({ force: true });
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			expect(await readChecked(page)).toEqual([]);
		});

		test('readOnly does not toggle', async ({ page }) => {
			const { switchEl } = await open(page, 'readonly', reference);
			await expect(switchEl).toHaveAttribute('aria-readonly', 'true');
			await expect(switchEl).toHaveAttribute('data-readonly', '');
			await switchEl.click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			expect(await readChecked(page)).toEqual([]);
		});

		test('a wrapping label toggles the switch once', async ({ page }) => {
			const { switchEl } = await open(page, 'label', reference);
			await page.getByText('Toggle').click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'true');
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
			const { switchEl } = await open(page, 'native', reference);
			await expect(switchEl).toHaveAttribute('id', 'tested-switch');
			expect(await switchEl.evaluate((element) => element.tagName)).toBe('BUTTON');
			await switchEl.focus();
			await page.keyboard.press('Enter');
			await expect(switchEl).toHaveAttribute('aria-checked', 'true');
			await page.keyboard.press('Space');
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
		});

		// Svelte calls event.preventDefault(); React calls event.preventBaseUIHandler().
		test('consumer onclick can skip the switch handler', async ({ page }) => {
			const { switchEl } = await open(page, 'prevented', reference);
			await switchEl.click();
			await expect(switchEl).toHaveAttribute('aria-checked', 'false');
			expect(await readChecked(page)).toEqual([]);
		});
	});
});

test('svelte SSR renders an unchecked switch before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/switch?case=standalone')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="switch"');
	expect(html).toContain('aria-checked="false"');
	expect(html).toContain('data-unchecked');
	expect(html).toContain('type="checkbox"');
});
