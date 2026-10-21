// Each case runs against the Svelte CheckboxGroup and the React Base UI 1.9.0 reference.
// Sveltery renders a `<fieldset>` and real inputs, so the checks read the checked state, and
// a box's data attributes sit on the input's parent in Svelte.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'checkbox-group', scenario, reference);
}

function box(page: Page, name: string) {
	return page.getByRole('checkbox', { name, exact: true });
}

/** The element that carries a checkbox's data attributes. */
function painted(page: Page, name: string, reference: boolean) {
	return reference ? box(page, name) : box(page, name).locator('..');
}

async function calls(page: Page) {
	return JSON.parse(await page.getByTestId('calls').innerText()) as {
		value: string[];
		reason: string;
		canceled: boolean;
	}[];
}

async function submitted(page: Page) {
	return JSON.parse(await page.getByTestId('submitted').innerText()) as string[];
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('a click adds a value and a second click removes it', async ({ page }) => {
			const { errors } = await open(page, 'select', reference);
			const group = page.getByRole('group', { name: 'Colors' });
			const a = box(page, 'A');
			const b = box(page, 'B');

			await expect(group).toBeVisible();
			await expect(a).not.toBeChecked();
			await expect(b).not.toBeChecked();

			await a.click();
			await expect(a).toBeChecked();
			await expect(painted(page, 'A', reference)).toHaveAttribute('data-checked', '');
			await expect(b).not.toBeChecked();
			expect(await calls(page)).toEqual([{ value: ['a'], reason: 'none', canceled: false }]);

			await b.click();
			await a.click();
			await expect(a).not.toBeChecked();
			await expect(b).toBeChecked();
			expect(errors).toEqual([]);
		});

		test('the initial value is checked before a click', async ({ page }) => {
			await open(page, 'initial', reference);
			await expect(box(page, 'A')).not.toBeChecked();
			await expect(box(page, 'B')).toBeChecked();
			await expect(painted(page, 'B', reference)).toHaveAttribute('data-checked', '');
		});

		test('a disabled group does not check', async ({ page }) => {
			await open(page, 'disabled', reference);
			const a = box(page, 'A');
			await expect(page.getByRole('group', { name: 'Colors' })).toHaveAttribute(
				'data-disabled',
				''
			);
			await expect(a).toBeDisabled();
			await a.click({ force: true });
			await expect(a).not.toBeChecked();
			expect(await calls(page)).toEqual([]);
		});

		test('cancel keeps every checkbox unchecked', async ({ page }) => {
			await open(page, 'cancel', reference);
			await box(page, 'A').click();
			await expect(box(page, 'A')).not.toBeChecked();
			expect(await calls(page)).toEqual([{ value: ['a'], reason: 'none', canceled: true }]);
		});

		test('the owner and the group share one value', async ({ page }) => {
			await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner B' });
			const b = box(page, 'B');
			await expect(b).not.toBeChecked();
			await owner.click();
			await expect(b).toBeChecked();
			await b.click();
			await expect(owner).not.toBeChecked();
			await expect(b).not.toBeChecked();
		});

		test('the parent checks every child, then clears them', async ({ page }) => {
			await open(page, 'parent', reference);
			const parent = box(page, 'All');
			const a = box(page, 'A');
			const b = box(page, 'B');
			await a.click();
			await expect(parent).toBeChecked({ indeterminate: true });
			await expect(a).toBeChecked();
			await parent.click();
			await expect(parent).toBeChecked();
			await expect(b).toBeChecked();
			await parent.click();
			await expect(a).not.toBeChecked();
			await expect(b).not.toBeChecked();
			await expect(parent).not.toBeChecked();
		});

		test('submit reports checked values and leaves the parent out', async ({ page }) => {
			await open(page, 'form', reference);
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => submitted(page)).toEqual([]);
			await box(page, 'A').click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => submitted(page)).toEqual(['a']);
			await box(page, 'All').click();
			await page.getByRole('button', { name: 'Submit' }).click();
			await expect.poll(async () => submitted(page)).toEqual(['a', 'b']);
		});
	});
}

test('svelte SSR renders the checked checkbox before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/checkbox-group?case=initial')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toMatch(/<fieldset[^>]*aria-label="Colors"/);
	expect(html).toMatch(/<input[^>]*value="b"[^>]*checked/);
	expect(html).toContain('data-checked');
});
