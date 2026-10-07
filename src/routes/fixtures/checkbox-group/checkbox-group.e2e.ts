// Each case runs against the Svelte CheckboxGroup and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';

async function open(page: Page, scenario: string, reference: boolean) {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(`/fixtures/checkbox-group?case=${scenario}${reference ? '&reference' : ''}`);
	await expect(page.locator('main')).toHaveAttribute('data-hydrated', 'true');
	return { errors };
}

function box(page: Page, name: string) {
	return page.getByRole('checkbox', { name, exact: true });
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

			await expect(group).toHaveAttribute('role', 'group');
			await expect(a).toHaveAttribute('aria-checked', 'false');
			await expect(b).toHaveAttribute('aria-checked', 'false');

			await a.click();
			await expect(a).toHaveAttribute('aria-checked', 'true');
			await expect(a).toHaveAttribute('data-checked', '');
			await expect(b).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([{ value: ['a'], reason: 'none', canceled: false }]);

			await b.click();
			await a.click();
			await expect(a).toHaveAttribute('aria-checked', 'false');
			await expect(b).toHaveAttribute('aria-checked', 'true');
			expect(errors).toEqual([]);
		});

		test('the initial value is checked before a click', async ({ page }) => {
			await open(page, 'initial', reference);
			await expect(box(page, 'A')).toHaveAttribute('aria-checked', 'false');
			await expect(box(page, 'B')).toHaveAttribute('aria-checked', 'true');
			await expect(box(page, 'B')).toHaveAttribute('data-checked', '');
		});

		test('a disabled group does not check', async ({ page }) => {
			await open(page, 'disabled', reference);
			const a = box(page, 'A');
			await expect(page.getByRole('group', { name: 'Colors' })).toHaveAttribute(
				'data-disabled',
				''
			);
			await expect(a).toHaveAttribute('aria-disabled', 'true');
			await a.click({ force: true });
			await expect(a).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([]);
		});

		test('cancel keeps every checkbox unchecked', async ({ page }) => {
			await open(page, 'cancel', reference);
			await box(page, 'A').click();
			await expect(box(page, 'A')).toHaveAttribute('aria-checked', 'false');
			expect(await calls(page)).toEqual([{ value: ['a'], reason: 'none', canceled: true }]);
		});

		test('the owner and the group share one value', async ({ page }) => {
			await open(page, 'bound', reference);
			const owner = page.getByRole('checkbox', { name: 'Owner B' });
			const b = box(page, 'B');
			await expect(b).toHaveAttribute('aria-checked', 'false');
			await owner.click();
			await expect(b).toHaveAttribute('aria-checked', 'true');
			await b.click();
			await expect(owner).not.toBeChecked();
			await expect(b).toHaveAttribute('aria-checked', 'false');
		});

		test('the parent checks every child, then clears them', async ({ page }) => {
			await open(page, 'parent', reference);
			const parent = box(page, 'All');
			const a = box(page, 'A');
			const b = box(page, 'B');
			await a.click();
			await expect(parent).toHaveAttribute('aria-checked', 'mixed');
			await expect(a).toHaveAttribute('aria-checked', 'true');
			await parent.click();
			await expect(parent).toHaveAttribute('aria-checked', 'true');
			await expect(b).toHaveAttribute('aria-checked', 'true');
			await parent.click();
			await expect(a).toHaveAttribute('aria-checked', 'false');
			await expect(b).toHaveAttribute('aria-checked', 'false');
			await expect(parent).toHaveAttribute('aria-checked', 'false');
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
	expect(html).toContain('role="group"');
	expect(html).toContain('aria-checked="true"');
	expect(html).toContain('aria-checked="false"');
	expect(html).toContain('data-checked');
	expect(html).toContain('type="checkbox"');
});
