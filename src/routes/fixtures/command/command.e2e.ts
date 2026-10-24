import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';
import { openBeforeHydration } from '../hold-hydration.js';
import { forEachFramework } from '../framework-loop.js';
import { readOutput } from '../read-output.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const opened = await openFixture(page, 'command', scenario, reference);
	return { input: page.getByRole('combobox'), errors: opened.errors };
}

const selected = (page: Page) => page.locator('[cmdk-item][aria-selected="true"]');
const options = (page: Page) => page.getByRole('option');
const picks = (page: Page) => readOutput<string[]>(page, 'selected');

forEachFramework((reference, framework) => {
	test.describe(framework, () => {
		test('renders the cmdk anatomy and wires its ARIA', async ({ page }) => {
			const { input, errors } = await open(page, 'standalone', reference);
			const list = page.getByRole('listbox');
			await expect(page.locator('[cmdk-root]')).toHaveCount(1);
			await expect(page.locator('[cmdk-label]')).toHaveText('Command menu');
			await expect(input).toHaveAttribute('cmdk-input', '');
			await expect(input).toHaveAttribute('aria-autocomplete', 'list');
			await expect(input).toHaveAttribute('aria-expanded', 'true');
			await expect(input).toHaveAttribute('aria-controls', (await list.getAttribute('id'))!);
			await expect(list).toHaveAttribute('aria-label', 'Suggestions');
			await expect(options(page)).toHaveText([
				'Apple',
				'Banana',
				'Pineapple',
				'Carrot',
				'Cabbage',
				'Asparagus',
				'Settings'
			]);
			await expect(page.getByRole('group')).toHaveCount(2);
			await expect(page.getByRole('group').first()).toHaveAccessibleName('Fruits');
			await expect(page.getByRole('separator')).toHaveCount(1);
			await expect(options(page).nth(4)).toHaveAttribute('aria-disabled', 'true');
			await expect(options(page).nth(4)).toHaveAttribute('data-disabled', 'true');
			await expect(options(page).nth(2)).toHaveAttribute('data-value', 'pineapple');
			expect(errors).toEqual([]);
		});

		test('selects the first item on mount', async ({ page }) => {
			await open(page, 'standalone', reference);
			await expect(selected(page)).toHaveText('Apple');
			await expect(selected(page)).toHaveAttribute('data-selected', 'true');
			await expect(page.getByTestId('value')).toHaveText('Apple');
		});

		test('walks items with the arrow keys, skipping disabled ones', async ({ page }) => {
			const { input } = await open(page, 'standalone', reference);
			await input.focus();
			await page.keyboard.press('ArrowUp');
			await expect(selected(page)).toHaveText('Apple');
			for (const name of ['Banana', 'Pineapple', 'Carrot', 'Asparagus', 'Settings', 'Settings']) {
				await page.keyboard.press('ArrowDown');
				await expect(selected(page)).toHaveText(name);
			}
			await expect(page.getByTestId('value')).toHaveText('Settings');
		});

		test('wraps around the ends with loop', async ({ page }) => {
			const { input } = await open(page, 'loop', reference);
			await input.focus();
			await page.keyboard.press('ArrowUp');
			await expect(selected(page)).toHaveText('Settings');
			await page.keyboard.press('ArrowDown');
			await expect(selected(page)).toHaveText('Apple');
		});

		test('jumps with Home, End and the vim bindings', async ({ page }) => {
			const { input } = await open(page, 'standalone', reference);
			await input.focus();
			await page.keyboard.press('End');
			await expect(selected(page)).toHaveText('Settings');
			await page.keyboard.press('Home');
			await expect(selected(page)).toHaveText('Apple');
			await page.keyboard.press('Control+n');
			await expect(selected(page)).toHaveText('Banana');
			await page.keyboard.press('Control+p');
			await expect(selected(page)).toHaveText('Apple');
		});

		test('filters by text and keywords and shows Empty without a match', async ({ page }) => {
			const { input } = await open(page, 'standalone', reference);
			await input.fill('tro');
			await expect(options(page)).toHaveText(['Pineapple']);
			await expect(selected(page)).toHaveText('Pineapple');
			await expect(page.getByRole('separator')).toHaveCount(0);
			await input.fill('pref');
			await expect(options(page)).toHaveText(['Settings']);
			await input.fill('zzz');
			await expect(options(page)).toHaveCount(0);
			await expect(page.locator('[cmdk-empty]')).toHaveText('No results.');
			await input.fill('');
			await expect(options(page)).toHaveCount(7);
			await expect(page.locator('[cmdk-empty]')).toHaveCount(0);
		});

		test('calls onSelect on Enter and on click, never for a disabled item', async ({ page }) => {
			const { input } = await open(page, 'standalone', reference);
			await input.focus();
			await page.keyboard.press('ArrowDown');
			await page.keyboard.press('Enter');
			expect(await picks(page)).toEqual(['Banana']);
			await page.getByRole('option', { name: 'Settings' }).click();
			await page.getByRole('option', { name: 'Cabbage' }).click({ force: true });
			expect(await picks(page)).toEqual(['Banana', 'Settings']);
			await expect(selected(page)).toHaveText('Settings');
		});

		test('selects the item under the pointer', async ({ page }) => {
			await open(page, 'standalone', reference);
			await page.getByRole('option', { name: 'Carrot' }).hover();
			await expect(selected(page)).toHaveText('Carrot');
			await page.getByRole('option', { name: 'Cabbage' }).hover();
			await expect(selected(page)).toHaveText('Carrot');
		});
	});
});

test('svelte hydrates the full server list, then filters, ranks and keeps the bound selection', async ({
	page
}) => {
	const warnings: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'warning' || message.type() === 'error') warnings.push(message.text());
	});
	const held = await openBeforeHydration(page, 'command', 'preset');
	await expect(options(page)).toHaveText([
		'Apple',
		'Banana',
		'Pineapple',
		'Carrot',
		'Cabbage',
		'Asparagus',
		'Settings'
	]);
	await expect(selected(page)).toHaveCount(0);
	await expect(page.locator('[cmdk-empty]')).toHaveCount(0);
	await page.evaluate(() => {
		for (const option of document.querySelectorAll('[cmdk-item]'))
			(option as HTMLElement & { fromServer?: boolean }).fromServer = true;
	});

	await held.hydrate();

	await expect(options(page)).toHaveText(['Settings', 'Cabbage', 'Carrot', 'Pineapple']);
	const adopted = await page.evaluate(() =>
		[...document.querySelectorAll('[cmdk-item]')].map(
			(option) => (option as HTMLElement & { fromServer?: boolean }).fromServer === true
		)
	);
	expect(adopted).toEqual([true, true, true, true]);
	await expect(selected(page)).toHaveText('Carrot');
	await expect(page.getByRole('combobox')).toHaveAttribute(
		'aria-activedescendant',
		(await selected(page).getAttribute('id'))!
	);
	expect(warnings).toEqual([]);
});
