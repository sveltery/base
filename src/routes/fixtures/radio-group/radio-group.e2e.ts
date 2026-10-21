// Each case runs against the Svelte RadioGroup and the React Base UI 1.9.0 reference.
// Sveltery renders the group as a `<fieldset>` and each radio as a real input over its box, so
// the checks read the checked state, and the box's data attributes sit on the input's parent.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { forEachFramework } from '../framework-loop.js';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'radio-group', scenario, reference);
}

function radio(page: Page, name: string) {
	return page.getByRole('radio', { name, exact: true });
}

/** The element that carries a radio's state attributes: the input's box in Svelte. */
function boxOf(control: Locator, reference: boolean) {
	return reference ? control : control.locator('..');
}

async function calls(page: Page) {
	return JSON.parse(await page.getByTestId('calls').innerText()) as {
		value: string;
		reason: string;
		canceled: boolean;
	}[];
}

forEachFramework((reference, framework) => {
	test.describe(framework, () => {
		test('a click selects one radio and releases the other', async ({ page }) => {
			const { errors } = await open(page, 'select', reference);
			const group = page.getByRole('radiogroup', { name: 'Colors' });
			const a = radio(page, 'A');
			const b = radio(page, 'B');

			await expect(group).toHaveAttribute('role', 'radiogroup');
			await expect(a).not.toBeChecked();
			await expect(a).toHaveAttribute('tabindex', '0');
			await expect(b).toHaveAttribute('tabindex', '-1');

			await a.click();
			await expect(a).toBeChecked();
			await expect(boxOf(a, reference)).toHaveAttribute('data-checked', '');
			await expect(b).not.toBeChecked();
			expect(await calls(page)).toEqual([{ value: 'a', reason: 'none', canceled: false }]);

			await b.click();
			await expect(a).not.toBeChecked();
			await expect(b).toBeChecked();
			expect(errors).toEqual([]);
		});

		test('the selected radio starts as the tab stop', async ({ page }) => {
			await open(page, 'initial', reference);
			await expect(radio(page, 'A')).toHaveAttribute('tabindex', '-1');
			await expect(radio(page, 'B')).toBeChecked();
			await expect(radio(page, 'B')).toHaveAttribute('tabindex', '0');
		});

		test('arrows select, loop, and ignore Home and End', async ({ page }) => {
			await open(page, 'keyboard', reference);
			const a = radio(page, 'A');
			const b = radio(page, 'B');
			const c = radio(page, 'C');
			await a.focus();
			await page.keyboard.press('ArrowDown');
			await expect(b).toBeFocused();
			await expect(b).toBeChecked();
			await page.keyboard.press('ArrowRight');
			await expect(c).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await expect(a).toBeFocused();
			await page.keyboard.press('Home');
			await expect(a).toBeFocused();
			await page.keyboard.press('End');
			await expect(a).toBeFocused();
			await page.keyboard.down('Shift');
			await page.keyboard.press('ArrowDown');
			await page.keyboard.up('Shift');
			await expect(b).toBeFocused();
			await a.focus();
			await page.keyboard.press('Enter');
			await expect(a).not.toBeChecked();
			await page.keyboard.press('Space');
			await expect(a).toBeChecked();
		});

		test('rtl horizontal arrows are mirrored', async ({ page }) => {
			await open(page, 'rtl', reference);
			const a = radio(page, 'A');
			const b = radio(page, 'B');
			await a.focus();
			await page.keyboard.press('ArrowLeft');
			await expect(b).toBeFocused();
			await expect(b).toBeChecked();
			await page.keyboard.press('ArrowRight');
			await expect(a).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await expect(b).toBeFocused();
		});

		test('a disabled group does not select', async ({ page }) => {
			await open(page, 'disabled', reference);
			const group = page.getByRole('radiogroup', { name: 'Colors' });
			const a = radio(page, 'A');
			// Sveltery disables the fieldset natively. Base UI sets aria-disabled.
			if (reference) await expect(group).toHaveAttribute('aria-disabled', 'true');
			else await expect(group).toHaveAttribute('disabled');
			await expect(group).toHaveAttribute('data-disabled', '');
			await a.click({ force: true });
			await expect(a).not.toBeChecked();
			expect(await calls(page)).toEqual([]);
		});

		test('a read-only group does not select', async ({ page }) => {
			await open(page, 'readonly', reference);
			const group = page.getByRole('radiogroup', { name: 'Colors' });
			const a = radio(page, 'A');
			await expect(group).toHaveAttribute('aria-readonly', 'true');
			await a.click();
			await expect(a).not.toBeChecked();
			expect(await calls(page)).toEqual([]);
		});

		test('cancel keeps every radio unchecked', async ({ page }) => {
			await open(page, 'cancel', reference);
			const a = radio(page, 'A');
			await a.click();
			await expect(a).not.toBeChecked();
			expect(await calls(page)).toEqual([{ value: 'a', reason: 'none', canceled: true }]);
		});

		test('the first pick writes into an empty bind', async ({ page }) => {
			await open(page, 'bound', reference);
			await expect(page.getByTestId('value')).toHaveText('none');
			await radio(page, 'B').click();
			await expect(radio(page, 'B')).toBeChecked();
			await expect(page.getByTestId('value')).toHaveText('b');
			await expect(page.getByRole('checkbox', { name: 'Owner B' })).toBeChecked();
		});

		test('the owner and the group share one value', async ({ page }) => {
			await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner B' });
			const a = radio(page, 'A');
			const b = radio(page, 'B');
			await owner.click();
			await expect(b).toBeChecked();
			await a.click();
			await expect(a).toBeChecked();
			await expect(owner).not.toBeChecked();
			await owner.click();
			await expect(b).toBeChecked();
			await expect(a).not.toBeChecked();
		});

		test('required blocks submit until a radio is selected', async ({ page }) => {
			await open(page, 'required', reference);
			const group = page.getByRole('radiogroup', { name: 'Colors' });
			await expect(group).toHaveAttribute('aria-required', 'true');
			await expect(group).toHaveAttribute('data-required', '');
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByTestId('submitted')).toHaveText('0');
			await radio(page, 'A').click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect(page.getByTestId('submitted')).toHaveText('1');
		});

		test('the fieldset legend labels the group', async ({ page }) => {
			await open(page, 'legend', reference);
			const legend = page.getByText('Legend', { exact: true });
			const group = page.getByRole('radiogroup', { name: 'Legend' });
			await expect(group).toHaveAttribute(
				'aria-labelledby',
				(await legend.getAttribute('id')) ?? ''
			);
		});
	});
});

test('svelte SSR renders a tab stop when nothing is selected', async ({ request }) => {
	const html = await (await request.get('/fixtures/radio-group?case=select')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toMatch(/<fieldset[^>]*role="radiogroup"/);
	expect(html).toContain('tabindex="0"');
	expect(html).toContain('tabindex="-1"');
	expect(html).not.toMatch(/<input[^>]*type="radio"[^>]*\schecked/);
});

test('svelte SSR renders the selected radio tab stop before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/radio-group?case=initial')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toMatch(/<fieldset[^>]*role="radiogroup"/);
	const b = html.match(/<input[^>]*aria-label="B"[^>]*>/)?.[0] ?? '';
	const a = html.match(/<input[^>]*aria-label="A"[^>]*>/)?.[0] ?? '';
	expect(b).toContain('type="radio"');
	expect(b).toMatch(/\schecked/);
	expect(b).toContain('tabindex="0"');
	expect(a).not.toMatch(/\schecked/);
	expect(a).toContain('tabindex="-1"');
	expect(html).toContain('data-checked');
});
