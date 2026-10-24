// Each case runs against the Svelte Questionnaire and the React @shadcn/react 0.3.1 reference.
import { expect, test, type Page } from '@playwright/test';
import { openFixture } from '../open-fixture.js';

function open(page: Page, scenario: string, reference: boolean) {
	return openFixture(page, 'questionnaire', scenario, reference);
}

for (const reference of [false, true]) {
	const framework = reference ? 'react' : 'svelte';

	test.describe(framework, () => {
		test('shows one item at a time and validates before moving on', async ({ page }) => {
			const { errors } = await open(page, 'steps', reference);
			const root = page.getByTestId('root');
			await expect(page.getByTestId('progress')).toHaveText('Question 1 of 2');
			await expect(page.getByTestId('progress')).toHaveAttribute('role', 'progressbar');
			await expect(page.getByTestId('progress')).toHaveAttribute('aria-valuenow', '1');
			await expect(root).toHaveAttribute('data-current', '1');
			await expect(root).toHaveAttribute('data-total', '2');
			await expect(root).toHaveAttribute('data-first', '');
			await expect(page.getByTestId('size')).toHaveAttribute('data-active', '');
			await expect(page.getByTestId('size')).toHaveAttribute('data-status', 'unanswered');
			await expect(page.getByTestId('notes')).toBeHidden();
			await expect(page.getByTestId('previous')).toHaveAttribute('data-hidden', '');
			await expect(page.getByTestId('skip')).toHaveAttribute('data-hidden', '');
			await expect(page.getByTestId('next')).toHaveAttribute('data-visible', '');
			await expect(page.getByTestId('next')).toHaveText('Next');
			await expect(page.getByTestId('submit')).toBeHidden();
			await expect(page.getByTestId('size-error')).toBeHidden();

			await page.getByTestId('next').click();
			await expect(page.getByTestId('size')).toHaveAttribute('aria-invalid', 'true');
			await expect(page.getByTestId('size')).toHaveAttribute('data-invalid', '');
			await expect(page.getByTestId('size-error')).toHaveText('Choose an answer to continue.');
			await expect(page.getByTestId('size-error')).toHaveAttribute('role', 'alert');
			await expect(page.getByTestId('size-small-input')).toBeFocused();

			await page.getByTestId('size-large').click();
			await expect(page.getByTestId('size')).not.toHaveAttribute('aria-invalid');
			await expect(page.getByTestId('size-large')).toHaveAttribute('data-checked', '');
			await expect(page.getByTestId('size-small')).toHaveAttribute('data-unchecked', '');
			await expect(page.getByTestId('size-large-input')).toHaveAttribute('type', 'radio');
			await expect(page.getByTestId('next')).toHaveAttribute('data-status', 'answered');
			await page.getByTestId('next').click();

			await expect(page.getByTestId('progress')).toHaveText('Question 2 of 2');
			await expect(root).toHaveAttribute('data-last', '');
			await expect(page.getByTestId('size')).toBeHidden();
			await expect(page.getByTestId('notes')).toBeFocused();
			await expect(page.getByTestId('previous')).toHaveAttribute('data-visible', '');
			await expect(page.getByTestId('skip')).toHaveAttribute('data-visible', '');
			await expect(page.getByTestId('next')).toBeHidden();
			await expect(page.getByTestId('submit')).toHaveAttribute('data-shortcut', 'Enter');

			await page.getByTestId('submit').click();
			await expect(page.getByTestId('notes-error')).toHaveText(
				'Choose an answer or skip this question.'
			);
			await expect(page.getByTestId('notes-input')).toBeFocused();
			await expect(page.getByTestId('submitted')).toHaveText('');

			await page.getByTestId('notes-input').fill('Thanks');
			await expect(page.getByTestId('notes-input')).toHaveAttribute('data-filled', '');
			await page.getByTestId('submit').click();
			await expect(page.getByTestId('submitted')).toHaveText(
				JSON.stringify([
					['size', 'large'],
					['notes', 'Thanks']
				])
			);

			await page.getByTestId('previous').click();
			await expect(page.getByTestId('size')).toHaveAttribute('data-active', '');
			await expect(page.getByTestId('size-large-input')).toBeChecked();
			expect(errors).toEqual([]);
		});

		test('moves with the keyboard', async ({ page }) => {
			await open(page, 'steps', reference);
			const size = page.getByTestId('size');
			await expect(size).toHaveAttribute(
				'aria-keyshortcuts',
				'Meta+Enter Control+Enter ArrowUp ArrowDown'
			);

			await page.getByTestId('size-small-input').focus();
			await page.keyboard.press('Space');
			await expect(page.getByTestId('size-small-input')).toHaveAttribute(
				'aria-keyshortcuts',
				'Enter'
			);
			await page.keyboard.press('Enter');
			await expect(page.getByTestId('notes')).toHaveAttribute('data-active', '');
			await expect(page.getByTestId('notes')).toHaveAttribute(
				'aria-keyshortcuts',
				'Meta+Enter Control+Enter ArrowUp ArrowDown ArrowLeft'
			);

			await page.keyboard.press('ArrowLeft');
			await expect(size).toHaveAttribute('data-active', '');
			await expect(size).toBeFocused();
			await page.keyboard.press('ArrowRight');
			await expect(page.getByTestId('notes')).toHaveAttribute('data-active', '');

			await page.keyboard.press('ArrowDown');
			await expect(page.getByTestId('notes-input')).toBeFocused();
			await page.keyboard.type('Done');
			await page.keyboard.press('ArrowLeft');
			await expect(page.getByTestId('notes')).toHaveAttribute('data-active', '');
			await page.keyboard.press('ControlOrMeta+Enter');
			await expect(page.getByTestId('submitted')).toHaveText(
				JSON.stringify([
					['size', 'small'],
					['notes', 'Done']
				])
			);
		});

		test('letter shortcuts select their choice', async ({ page }) => {
			await open(page, 'shortcuts', reference);
			await expect(page.getByTestId('root')).toHaveAttribute('data-shortcuts', 'letters');
			await expect(page.getByTestId('size-choices')).toHaveAttribute('data-shortcuts', 'letters');
			await expect(page.getByTestId('size-small-shortcut')).toHaveText('A');
			await expect(page.getByTestId('size-large-shortcut')).toHaveText('B');
			await expect(page.getByTestId('size-large-shortcut')).toHaveAttribute('aria-hidden', 'true');
			await expect(page.getByTestId('size-large')).toHaveAttribute('data-shortcut', 'B');
			await expect(page.getByTestId('size-large-input')).toHaveAttribute('aria-keyshortcuts', 'B');

			await page.getByTestId('size').focus();
			await page.keyboard.press('b');
			await expect(page.getByTestId('size-large-input')).toBeChecked();
			await expect(page.getByTestId('size-large-input')).toBeFocused();
			await page.keyboard.press('a');
			await expect(page.getByTestId('size-small-input')).toBeChecked();
			await expect(page.getByTestId('size-large-input')).not.toBeChecked();
		});

		test('skip leaves an optional item out of the form', async ({ page }) => {
			await open(page, 'optional', reference);
			await expect(page.getByTestId('skip')).toHaveAttribute('data-visible', '');
			await page.getByTestId('size-small').click();
			await page.getByTestId('skip').click();
			await expect(page.getByTestId('notes')).toHaveAttribute('data-active', '');
			await expect(page.getByTestId('size')).toHaveAttribute('data-status', 'skipped');
			await expect(page.getByTestId('size-small-input')).not.toBeChecked();

			await page.getByTestId('skip').click();
			await expect(page.getByTestId('notes')).toHaveAttribute('data-status', 'skipped');
			await expect(page.getByTestId('submitted')).toHaveText('[]');
		});

		test('a multiple item submits every checked choice', async ({ page }) => {
			await open(page, 'multiple', reference);
			await expect(page.getByTestId('size')).toHaveAttribute('data-multiple', '');
			await expect(page.getByTestId('size-small-input')).toHaveAttribute('type', 'checkbox');
			await page.getByTestId('size-small').click();
			await page.getByTestId('size-large').click();
			await page.getByTestId('next').click();
			await page.getByTestId('notes-input').fill('Both');
			await page.getByTestId('submit').click();
			await expect(page.getByTestId('submitted')).toHaveText(
				JSON.stringify([
					['size', 'small'],
					['size', 'large'],
					['notes', 'Both']
				])
			);
		});

		test('preventDefault in a consumer handler skips the answer', async ({ page }) => {
			await open(page, 'prevented', reference);
			await page.getByTestId('size-large').click();
			await expect(page.getByTestId('size-large')).toHaveAttribute('data-unchecked', '');
			await expect(page.getByTestId('size')).toHaveAttribute('data-status', 'unanswered');
			await page.getByTestId('size-small').click();
			await expect(page.getByTestId('size')).toHaveAttribute('data-status', 'answered');
			await page.getByTestId('next').click();
			await page.getByTestId('notes-input').fill('Ignored');
			await expect(page.getByTestId('notes-input')).toHaveAttribute('data-empty', '');
			await expect(page.getByTestId('notes')).toHaveAttribute('data-status', 'unanswered');
		});

		test('reset clears answers and returns to the first item', async ({ page }) => {
			await open(page, 'steps', reference);
			await page.getByTestId('size-large').click();
			await page.getByTestId('next').click();
			await page.getByTestId('notes-input').fill('Draft');
			await page.getByRole('button', { name: 'Reset' }).click();
			await expect(page.getByTestId('size')).toHaveAttribute('data-active', '');
			await expect(page.getByTestId('size-large-input')).not.toBeChecked();
			await expect(page.getByTestId('size')).toHaveAttribute('data-status', 'unanswered');
			await expect(page.getByTestId('notes-input')).toHaveAttribute('data-empty', '');
			// React detaches the emptied input from the form before the native reset runs, so the
			// text stays. See docs/upstream-differences.md, Questionnaire.
			await expect(page.getByTestId('notes-input')).toHaveValue(reference ? 'Draft' : '');
		});
	});
}
