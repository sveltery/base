// Each case runs against the Svelte Checkbox and the React Base UI 1.9.0 reference.
// Sveltery renders a real input over the box, so the checks read the checked state and the
// box's data attributes, which sit on the input's parent in Svelte.
import { expect, test, type Page } from '@playwright/test';
import { forEachFramework } from '../framework-loop.js';
import { openFixture } from '../open-fixture.js';
import { expectOwnerCleared } from '../owner-checked.js';
import { readChecked, readValues } from '../read-output.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const opened = await openFixture(page, 'checkbox', scenario, reference);
	const control = page.getByRole('checkbox', { name: 'Notifications' });
	return {
		checkbox: control,
		box: reference ? control : control.locator('..'),
		errors: opened.errors
	};
}

forEachFramework((reference, framework) => {
	test.describe(framework, () => {
		test('click toggles the checked state and data-checked', async ({ page }) => {
			const { checkbox, box, errors } = await open(page, 'standalone', reference);
			await expect(checkbox).not.toBeChecked();
			await expect(box).toHaveAttribute('data-unchecked', '');
			await checkbox.click();
			await expect(checkbox).toBeChecked();
			await expect(box).toHaveAttribute('data-checked', '');
			expect(await readChecked(page)).toEqual([{ checked: true, reason: 'none', canceled: false }]);
			await checkbox.click();
			await expect(checkbox).not.toBeChecked();
			expect(await readChecked(page)).toHaveLength(2);
			expect(errors).toEqual([]);
		});

		test('Space ticks the checkbox and Enter does not', async ({ page }) => {
			const { checkbox } = await open(page, 'standalone', reference);
			await checkbox.focus();
			await page.keyboard.press('Space');
			await expect(checkbox).toBeChecked();
			await page.keyboard.press('Enter');
			await expect(checkbox).toBeChecked();
		});

		test('owner-held state follows the owner and receives clicks', async ({ page }) => {
			const { checkbox } = await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner checked' });
			await expect(checkbox).not.toBeChecked();
			await owner.check();
			await expect(checkbox).toBeChecked();
			await checkbox.click();
			await expectOwnerCleared(page, checkbox);
		});

		test('canceling onCheckedChange keeps the state', async ({ page }) => {
			const { checkbox } = await open(page, 'cancel', reference);
			await checkbox.click();
			await expect(checkbox).not.toBeChecked();
			expect(await readChecked(page)).toEqual([{ checked: true, reason: 'none', canceled: true }]);
		});

		test('disabled never calls back', async ({ page }) => {
			const { checkbox, box } = await open(page, 'disabled', reference);
			await expect(checkbox).toBeDisabled();
			await expect(box).toHaveAttribute('data-disabled', '');
			await checkbox.click({ force: true });
			await expect(checkbox).not.toBeChecked();
			expect(await readChecked(page)).toEqual([]);
		});

		test('readOnly does not toggle', async ({ page }) => {
			const { checkbox, box } = await open(page, 'readonly', reference);
			await expect(checkbox).toHaveAttribute('aria-readonly', 'true');
			await expect(box).toHaveAttribute('data-readonly', '');
			await checkbox.click();
			await expect(checkbox).not.toBeChecked();
			expect(await readChecked(page)).toEqual([]);
		});

		test('a wrapping label toggles the checkbox once', async ({ page }) => {
			const { checkbox } = await open(page, 'label', reference);
			await page.getByText('Toggle').click();
			await expect(checkbox).toBeChecked();
			expect(await readChecked(page)).toEqual([{ checked: true, reason: 'none', canceled: false }]);
		});

		test('form submission cycles uncheckedValue and value', async ({ page }) => {
			const { checkbox } = await open(page, 'form', reference);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => readValues(page)).toEqual(['no']);
			await checkbox.click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => readValues(page)).toEqual(['no', 'yes']);
			await checkbox.click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => readValues(page)).toEqual(['no', 'yes', 'no']);
		});

		test('Enter submits the form and leaves the checkbox unticked', async ({ page }) => {
			const { checkbox } = await open(page, 'enter', reference);
			await checkbox.focus();
			await page.keyboard.press('Enter');
			await expect(checkbox).not.toBeChecked();
			await expect.poll(async () => readValues(page)).toEqual(['no']);
			expect(await readChecked(page)).toEqual([]);
		});

		test('native button keeps the id and Space ticks it', async ({ page }) => {
			test.skip(!reference, 'Sveltery renders a real input, with no native button host');
			const { checkbox } = await open(page, 'native', reference);
			await expect(checkbox).toHaveAttribute('id', 'tested-checkbox');
			expect(await checkbox.evaluate((element) => element.tagName)).toBe('BUTTON');
			await checkbox.focus();
			await page.keyboard.press('Enter');
			await expect(checkbox).not.toBeChecked();
			await page.keyboard.press('Space');
			await expect(checkbox).toBeChecked();
		});

		test('indeterminate stays mixed and shows the indicator', async ({ page }) => {
			const { checkbox, box } = await open(page, 'indeterminate', reference);
			await expect(checkbox).toBeChecked({ indeterminate: true });
			await expect(box).toHaveAttribute('data-indeterminate', '');
			await expect(page.getByTestId('indicator')).toHaveAttribute('data-indeterminate', '');
			await checkbox.click();
			await expect(checkbox).toBeChecked({ indeterminate: true });
			await expect(page.getByTestId('indicator')).toHaveCount(1);
		});

		// Svelte calls event.preventDefault(); React calls event.preventBaseUIHandler().
		test('consumer onclick can skip the checkbox handler', async ({ page }) => {
			const { checkbox } = await open(page, 'prevented', reference);
			await checkbox.click();
			await expect(checkbox).not.toBeChecked();
			expect(await readChecked(page)).toEqual([]);
		});
	});
});

test('svelte SSR renders an unticked checkbox before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/checkbox?case=standalone')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('data-unchecked');
	const input = html.match(/<input[^>]*aria-label="Notifications"[^>]*>/)?.[0] ?? '';
	expect(input).toContain('type="checkbox"');
	expect(input).not.toMatch(/\schecked/);
});

test('svelte SSR renders a mixed checkbox before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/checkbox?case=indeterminate')).text();
	expect(html).toContain('data-indeterminate');
});
