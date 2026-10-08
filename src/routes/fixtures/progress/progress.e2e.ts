// Each case runs against the Svelte Progress and the React Base UI 1.8.0 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

async function open(page: Page, scenario: string, reference: boolean) {
	const opened = await openFixture(page, 'progress', scenario, reference);
	return { progress: page.getByRole('progressbar'), errors: opened.errors };
}

async function inlineWidth(page: Page) {
	return page.getByTestId('indicator').evaluate((element) => (element as HTMLElement).style.width);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('determinate progress exposes value, label, and fill', async ({ page }) => {
			const { progress, errors } = await open(page, 'determinate', reference);
			const label = page.getByTestId('label');
			await expect(progress).toHaveAttribute('aria-valuenow', '30');
			await expect(progress).toHaveAttribute('aria-valuemin', '0');
			await expect(progress).toHaveAttribute('aria-valuemax', '100');
			await expect(progress).toHaveAttribute('aria-valuetext', '30%');
			await expect(progress).toHaveAttribute('data-progressing', '');
			await expect(label).toHaveAttribute('role', 'presentation');
			await expect(progress).toHaveAttribute(
				'aria-labelledby',
				(await label.getAttribute('id')) ?? ''
			);
			for (const part of [
				progress,
				label,
				page.getByTestId('value'),
				page.getByTestId('track'),
				page.getByTestId('indicator')
			]) {
				await expect(part).toHaveAttribute('data-progressing', '');
			}
			await expect(page.getByTestId('value')).toHaveText('30%');
			await expect(page.getByTestId('value')).toHaveAttribute('aria-hidden', 'true');
			expect(await inlineWidth(page)).toBe('30%');
			await expect(progress.locator('[role="presentation"]').last()).toHaveText('x');
			expect(errors).toEqual([]);
		});

		test('indeterminate progress has no value or fill', async ({ page }) => {
			const { progress, errors } = await open(page, 'indeterminate', reference);
			await expect(progress).toHaveAttribute('data-indeterminate', '');
			await expect(progress).not.toHaveAttribute('aria-valuenow');
			await expect(progress).toHaveAttribute('aria-valuetext', 'indeterminate progress');
			await expect(page.getByTestId('value')).toHaveText('');
			expect(await inlineWidth(page)).toBe('');
			expect(errors).toEqual([]);
		});

		test('buttons move through indeterminate, progressing, and complete', async ({ page }) => {
			const { progress } = await open(page, 'cycle', reference);
			await expect(progress).toHaveAttribute('data-indeterminate', '');
			await page.getByRole('button', { name: 'Halfway' }).click();
			await expect(progress).toHaveAttribute('data-progressing', '');
			await expect(progress).toHaveAttribute('aria-valuenow', '50');
			await expect(page.getByTestId('value')).toHaveText('50%');
			expect(await inlineWidth(page)).toBe('50%');
			await page.getByRole('button', { name: 'Complete' }).click();
			await expect(progress).toHaveAttribute('data-complete', '');
			await expect(progress).toHaveAttribute('aria-valuenow', '100');
			await expect(page.getByTestId('value')).toHaveText('100%');
			expect(await inlineWidth(page)).toBe('100%');
			await page.getByRole('button', { name: 'Indeterminate' }).click();
			await expect(progress).toHaveAttribute('data-indeterminate', '');
			await expect(progress).not.toHaveAttribute('aria-valuenow');
			await expect(page.getByTestId('value')).toHaveText('');
			expect(await inlineWidth(page)).toBe('');
		});

		test('a custom range normalizes and clamps the fill', async ({ page }) => {
			const { progress } = await open(page, 'range', reference);
			await expect(progress).toHaveAttribute('aria-valuenow', '30');
			await expect(progress).toHaveAttribute('aria-valuemin', '20');
			await expect(progress).toHaveAttribute('aria-valuemax', '40');
			await expect(progress).toHaveAttribute('aria-valuetext', '50%');
			expect(await inlineWidth(page)).toBe('50%');
			await page.getByRole('button', { name: 'Over' }).click();
			await expect(progress).toHaveAttribute('data-complete', '');
			await expect(progress).toHaveAttribute('aria-valuenow', '40');
			await expect(page.getByTestId('value')).toHaveText('100%');
			expect(await inlineWidth(page)).toBe('100%');
			await page.getByRole('button', { name: 'Under' }).click();
			await expect(progress).toHaveAttribute('data-progressing', '');
			await expect(progress).toHaveAttribute('aria-valuenow', '20');
			await expect(page.getByTestId('value')).toHaveText('0%');
			expect(await inlineWidth(page)).toBe('0%');
		});

		test('format and locale change the visible value', async ({ page }) => {
			const { progress } = await open(page, 'formatted', reference);
			await expect(page.getByTestId('value')).toHaveText('$30.00');
			await expect(progress).toHaveAttribute('aria-valuetext', '$30.00');
			await page.getByRole('button', { name: 'Switch currency' }).click();
			await expect(page.getByTestId('value')).toHaveText('€30.00');
			await expect(progress).toHaveAttribute('aria-valuetext', '€30.00');
		});

		test('an explicit locale formats the value', async ({ page }) => {
			await open(page, 'locale', reference);
			await expect(page.getByTestId('value')).toHaveText('70,51');
		});

		test('getAriaValueText describes determinate and indeterminate values', async ({ page }) => {
			const { progress } = await open(page, 'aria-text', reference);
			await expect(progress).toHaveAttribute('aria-valuetext', '30% uploaded');
			await expect(page.getByTestId('value')).toHaveText('30%');
			await page.getByRole('button', { name: 'Clear' }).click();
			await expect(progress).toHaveAttribute('aria-valuetext', 'Waiting to start');
			await expect(progress).not.toHaveAttribute('aria-valuenow');
			await expect(page.getByTestId('value')).toHaveText('');
		});

		test('value children receive the formatted and raw values', async ({ page }) => {
			await open(page, 'value-child', reference);
			await expect(page.getByTestId('value')).toHaveText('30%|30');
			await page.getByRole('button', { name: 'Clear' }).click();
			await expect(page.getByTestId('value')).toHaveText('indeterminate|null');
		});

		test('changing or removing the label updates aria-labelledby', async ({ page }) => {
			const { progress } = await open(page, 'label', reference);
			await expect(progress).toHaveAttribute('aria-labelledby', 'label-a');
			await page.getByRole('button', { name: 'Change id' }).click();
			await expect(progress).toHaveAttribute('aria-labelledby', 'label-b');
			await expect(page.getByTestId('label')).toHaveAttribute('id', 'label-b');
			await page.getByRole('button', { name: 'Remove label' }).click();
			await expect(progress).not.toHaveAttribute('aria-labelledby');
		});

		test('a non-finite value stays indeterminate', async ({ page }) => {
			const { progress } = await open(page, 'nonfinite', reference);
			await expect(progress).toHaveAttribute('data-indeterminate', '');
			await expect(progress).not.toHaveAttribute('aria-valuenow');
			await expect(progress).toHaveAttribute('aria-valuetext', 'indeterminate progress');
			await expect(page.getByTestId('value')).toHaveText('');
			expect(await inlineWidth(page)).toBe('');
		});

		test('min equal to max is complete with an empty fill', async ({ page }) => {
			const { progress } = await open(page, 'equal', reference);
			await expect(progress).toHaveAttribute('data-complete', '');
			await expect(progress).toHaveAttribute('aria-valuenow', '5');
			await expect(progress).toHaveAttribute('aria-valuetext', '0%');
			await expect(page.getByTestId('value')).toHaveText('0%');
			expect(await inlineWidth(page)).toBe('0%');
		});
	});
}

test('svelte SSR renders progress state before hydration', async ({ request }) => {
	const html = await (await request.get('/fixtures/progress?case=determinate')).text();
	expect(html).toContain('data-hydrated="false"');
	expect(html).toContain('role="progressbar"');
	expect(html).toContain('aria-valuenow="30"');
	expect(html).toContain('aria-valuemin="0"');
	expect(html).toContain('aria-valuemax="100"');
	expect(html).toContain('data-progressing');
	expect(html).toContain('30%');
});
