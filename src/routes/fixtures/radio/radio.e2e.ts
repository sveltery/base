// Each case runs against the Svelte Radio and the React Base UI 1.9.0 reference.
// These cases are the standalone radio. Base UI selects a radio without a group only when its
// value is the empty string. Sveltery renders a real input over the box, so a radio without a
// group follows its own `checked` state as a native radio does, and the box's data attributes
// sit on the input's parent in Svelte.
import { expect, test, type Page } from '@playwright/test';
import { forEachFramework } from '../framework-loop.js';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'radio', scenario, reference);
}

function radio(page: Page, name: string) {
	return page.getByRole('radio', { name });
}

/** The element that carries the state attributes: the input's box in Svelte. */
function boxOf(control: ReturnType<typeof radio>, reference: boolean) {
	return reference ? control : control.locator('..');
}

forEachFramework((reference, framework) => {
	test.describe(framework, () => {
		test('a checked radio keeps the indicator', async ({ page }) => {
			const { errors } = await open(page, 'checked', reference);
			const control = radio(page, 'Checked');
			await expect(control).toBeChecked();
			await expect(boxOf(control, reference)).toHaveAttribute('data-checked', '');
			await expect(control).toHaveAttribute('data-composite-item-active', '');
			await expect(page.getByTestId('indicator')).toHaveAttribute('data-checked', '');
			await control.click();
			await expect(control).toBeChecked();
			expect(errors).toEqual([]);
		});

		test('an unchecked radio shows the unchecked state', async ({ page }) => {
			const { errors } = await open(page, 'unchecked', reference);
			const control = radio(page, 'Blue');
			await expect(control).not.toBeChecked();
			await expect(boxOf(control, reference)).toHaveAttribute('data-unchecked', '');
			expect(errors).toEqual([]);
		});

		test('a radio without a group stays unchecked after click and Space', async ({ page }) => {
			test.skip(!reference, 'Sveltery selects a radio without a group, as a native radio does');
			await open(page, 'unchecked', reference);
			const control = radio(page, 'Blue');
			await expect(control).not.toHaveAttribute('value');
			await control.click();
			await expect(control).not.toBeChecked();
			await control.focus();
			await page.keyboard.press('Space');
			await expect(control).not.toBeChecked();
		});

		test('a radio without a group selects on click, as a native radio does', async ({ page }) => {
			test.skip(reference, 'Base UI selects a radio without a group only for an empty value');
			await open(page, 'unchecked', reference);
			const control = radio(page, 'Blue');
			await expect(control).toHaveAttribute('value', 'blue');
			await control.click();
			await expect(control).toBeChecked();
			await expect(control.locator('..')).toHaveAttribute('data-checked', '');
		});

		test('disabled stays unchecked', async ({ page }) => {
			const { errors } = await open(page, 'disabled', reference);
			const control = radio(page, 'Blue');
			await expect(control).toBeDisabled();
			await expect(boxOf(control, reference)).toHaveAttribute('data-disabled', '');
			await control.click({ force: true });
			await expect(control).not.toBeChecked();
			expect(errors).toEqual([]);
		});

		test('readOnly sets data-readonly and stays unchecked', async ({ page }) => {
			await open(page, 'readonly', reference);
			const control = radio(page, 'Blue');
			await expect(control).not.toHaveAttribute('aria-readonly');
			await expect(boxOf(control, reference)).toHaveAttribute('data-readonly', '');
			await control.click();
			await expect(control).not.toBeChecked();
		});

		test('a sibling label names the radio', async ({ page }) => {
			await open(page, 'label', reference);
			await expect(page.getByRole('radio')).toHaveAccessibleName('Label');
		});

		test('native button keeps the id and Enter does not select it', async ({ page }) => {
			test.skip(!reference, 'Sveltery renders a real input, with no native button host');
			await open(page, 'native', reference);
			const control = radio(page, 'Blue');
			await expect(control).toHaveAttribute('id', 'tested-radio');
			expect(await control.evaluate((element) => element.tagName)).toBe('BUTTON');
			await control.focus();
			await page.keyboard.press('Enter');
			await expect(control).not.toBeChecked();
			await page.keyboard.press('Space');
			await expect(control).not.toBeChecked();
		});

		test('a required radio without a name still submits', async ({ page }) => {
			await open(page, 'required', reference);
			const control = radio(page, 'Blue');
			await expect(control).not.toHaveAttribute('aria-required');
			await expect(boxOf(control, reference)).toHaveAttribute('data-required', '');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByTestId('submitted')).toHaveText('1');
		});

		test('Enter does not select the radio', async ({ page }) => {
			await open(page, 'enter', reference);
			const control = radio(page, 'Blue');
			await control.focus();
			await page.keyboard.press('Enter');
			await expect(control).not.toBeChecked();
			// A native radio submits its form on Enter. Base UI's button host does not.
			await expect(page.getByTestId('submitted')).toHaveText(reference ? '0' : '1');
		});

		test('null serializes to an empty input value and stays unchecked', async ({ page }) => {
			await open(page, 'null', reference);
			const control = radio(page, 'None');
			await expect(control).not.toBeChecked();
			const submittedValue = await control.evaluate((element) => {
				const input = element instanceof HTMLInputElement ? element : element.nextElementSibling;
				return input instanceof HTMLInputElement ? input.value : 'missing';
			});
			expect(submittedValue).toBe('');
		});

		test('a click reaches ancestors once', async ({ page }) => {
			await open(page, 'bubble', reference);
			const control = radio(page, 'Blue');
			await control.click();
			await expect(page.getByTestId('parent-clicks')).toHaveText('1');
			if (reference) await expect(control).not.toBeChecked();
			else await expect(control).toBeChecked();
		});

		test('stopPropagation keeps the click off ancestors', async ({ page }) => {
			await open(page, 'stop', reference);
			await radio(page, 'Blue').click();
			await expect(page.getByTestId('parent-clicks')).toHaveText('0');
		});
	});
});

test('svelte SSR renders a checked radio before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/radio?case=checked')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('data-checked');
	const input = html.match(/<input[^>]*aria-label="Checked"[^>]*>/)?.[0] ?? '';
	expect(input).toContain('type="radio"');
	expect(input).toMatch(/\schecked/);
});

test('svelte SSR renders an unchecked radio before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/radio?case=unchecked')).text();
	expect(html).toContain('data-unchecked');
	const input = html.match(/<input[^>]*aria-label="Blue"[^>]*>/)?.[0] ?? '';
	expect(input).toContain('type="radio"');
	expect(input).not.toMatch(/\schecked/);
});
