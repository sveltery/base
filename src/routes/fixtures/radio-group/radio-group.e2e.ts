// Each case runs against the Svelte RadioGroup and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'radio-group', scenario, reference);
}

function radio(page: Page, name: string) {
	return page.getByRole('radio', { name, exact: true });
}

async function calls(page: Page) {
	return JSON.parse(await page.getByTestId('calls').innerText()) as {
		value: string;
		reason: string;
		canceled: boolean;
	}[];
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('a click selects one radio and releases the other', async ({ page }) => {
			const { errors } = await open(page, 'select', reference);
			const group = page.getByRole('radiogroup', { name: 'Colors' });
			const a = radio(page, 'A');
			const b = radio(page, 'B');

			await expect(group).toHaveAttribute('role', 'radiogroup');
			await expect(a).toHaveAttribute('aria-checked', 'false');
			await expect(a).toHaveAttribute('tabindex', '0');
			await expect(b).toHaveAttribute('tabindex', '-1');

			await a.click();
			await expect(a).toHaveAttribute('aria-checked', 'true');
			await expect(a).toHaveAttribute('data-checked', '');
			await expect(b).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([{ value: 'a', reason: 'none', canceled: false }]);

			await b.click();
			await expect(a).toHaveAttribute('aria-checked', 'false');
			await expect(b).toHaveAttribute('aria-checked', 'true');
			expect(errors).toEqual([]);
		});

		test('the selected radio starts as the tab stop', async ({ page }) => {
			await open(page, 'initial', reference);
			await expect(radio(page, 'A')).toHaveAttribute('tabindex', '-1');
			await expect(radio(page, 'B')).toHaveAttribute('aria-checked', 'true');
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
			await expect(b).toHaveAttribute('aria-checked', 'true');
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
			await expect(a).toHaveAttribute('aria-checked', 'false');
			await page.keyboard.press('Space');
			await expect(a).toHaveAttribute('aria-checked', 'true');
		});

		test('rtl horizontal arrows are mirrored', async ({ page }) => {
			await open(page, 'rtl', reference);
			const a = radio(page, 'A');
			const b = radio(page, 'B');
			await a.focus();
			await page.keyboard.press('ArrowLeft');
			await expect(b).toBeFocused();
			await expect(b).toHaveAttribute('aria-checked', 'true');
			await page.keyboard.press('ArrowRight');
			await expect(a).toBeFocused();
			await page.keyboard.press('ArrowDown');
			await expect(b).toBeFocused();
		});

		test('a disabled group does not select', async ({ page }) => {
			await open(page, 'disabled', reference);
			const group = page.getByRole('radiogroup', { name: 'Colors' });
			const a = radio(page, 'A');
			await expect(group).toHaveAttribute('aria-disabled', 'true');
			await expect(group).toHaveAttribute('data-disabled', '');
			await a.click({ force: true });
			await expect(a).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([]);
		});

		test('a read-only group does not select', async ({ page }) => {
			await open(page, 'readonly', reference);
			const group = page.getByRole('radiogroup', { name: 'Colors' });
			const a = radio(page, 'A');
			await expect(group).toHaveAttribute('aria-readonly', 'true');
			await a.click();
			await expect(a).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([]);
		});

		test('cancel keeps every radio unchecked', async ({ page }) => {
			await open(page, 'cancel', reference);
			const a = radio(page, 'A');
			await a.click();
			await expect(a).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([{ value: 'a', reason: 'none', canceled: true }]);
		});

		test('the first pick writes into an empty bind', async ({ page }) => {
			await open(page, 'bound', reference);
			await expect(page.getByTestId('value')).toHaveText('none');
			await radio(page, 'B').click();
			await expect(radio(page, 'B')).toHaveAttribute('aria-checked', 'true');
			await expect(page.getByTestId('value')).toHaveText('b');
			await expect(page.getByRole('checkbox', { name: 'Owner B' })).toBeChecked();
		});

		test('the owner and the group share one value', async ({ page }) => {
			await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner B' });
			const a = radio(page, 'A');
			const b = radio(page, 'B');
			await owner.click();
			await expect(b).toHaveAttribute('aria-checked', 'true');
			await a.click();
			await expect(a).toHaveAttribute('aria-checked', 'true');
			await expect(owner).not.toBeChecked();
			await owner.click();
			await expect(b).toHaveAttribute('aria-checked', 'true');
			await expect(a).toHaveAttribute('aria-checked', 'false');
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
}

test('svelte SSR renders a tab stop when nothing is selected', async ({ request }) => {
	const html = await (await request.get('/fixtures/radio-group?case=select')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="radiogroup"');
	expect(html).toContain('tabindex="0"');
	expect(html).toContain('tabindex="-1"');
	expect(html).not.toContain('aria-checked="true"');
});

test('svelte SSR renders the selected radio tab stop before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/radio-group?case=initial')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="radiogroup"');
	expect(html).toContain('aria-checked="true"');
	expect(html).toContain('aria-checked="false"');
	expect(html).toContain('tabindex="0"');
	expect(html).toContain('tabindex="-1"');
	expect(html).toContain('data-checked');
	expect(html).toContain('type="radio"');
});
