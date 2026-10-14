// tanstackField against a real TanStack Svelte Form, inside Base's Form and Field.
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TanstackAsyncHarness from '../../../tests/TanstackAsyncHarness.svelte';
import TanstackFieldHarness from '../../../tests/TanstackFieldHarness.svelte';

function json(testId: string) {
	return JSON.parse(page.getByTestId(testId).element().textContent ?? 'null');
}

function input(testId: string) {
	return page.getByTestId(testId).element() as HTMLInputElement;
}

/** An error part renders nothing while it has no message. */
function text(testId: string) {
	return document.querySelector(`[data-testid="${testId}"]`)?.textContent?.trim() ?? '';
}

const defaults = { email: 'ada@example.com', age: 36, agree: false, tags: ['svelte'] };

describe('tanstackField', () => {
	it('renders TanStack values into the controls with encoded names', async () => {
		render(TanstackFieldHarness);

		expect(input('email').value).toBe('ada@example.com');
		expect(input('email').name).toBe('email');
		expect(input('email').type).toBe('email');
		expect(input('age').value).toBe('36');
		expect(input('age').type).toBe('number');
		expect(input('agree').checked).toBe(false);
		expect(input('svelte').checked).toBe(true);
		expect(input('kit').checked).toBe(false);
		expect(json('values')).toEqual(defaults);
	});

	it('reports text, number, boolean and string[] input to TanStack', async () => {
		render(TanstackFieldHarness);
		await userEvent.fill(page.getByTestId('email'), 'grace@example.com');
		await userEvent.fill(page.getByTestId('age'), '41');
		await userEvent.click(page.getByTestId('agree'));
		await userEvent.click(page.getByTestId('kit'));

		await expect
			.poll(() => json('values'))
			.toEqual({
				email: 'grace@example.com',
				age: 41,
				agree: true,
				tags: ['svelte', 'kit']
			});

		await userEvent.click(page.getByTestId('svelte'));
		await userEvent.clear(page.getByTestId('age'));
		await expect
			.poll(() => json('values'))
			.toEqual({
				email: 'grace@example.com',
				agree: true,
				tags: ['kit']
			});
		expect(input('age').value).toBe('');
	});

	it("shows TanStack's errors on the Field and marks the control invalid", async () => {
		render(TanstackFieldHarness);
		await userEvent.fill(page.getByTestId('email'), 'nope');

		await expect.poll(() => text('email-error')).toBe('Enter an email');
		expect(input('email').getAttribute('aria-invalid')).toBe('true');

		await userEvent.fill(page.getByTestId('email'), 'nope@example.com');
		await expect.poll(() => text('email-error')).toBe('');
		expect(input('email').getAttribute('aria-invalid')).toBe(null);
	});

	it("reads touched and dirty from TanStack's meta", async () => {
		render(TanstackFieldHarness);
		expect(json('email-meta')).toEqual({ touched: false, dirty: false, issues: [] });

		await userEvent.fill(page.getByTestId('email'), 'nope');
		await expect
			.poll(() => json('email-meta'))
			.toEqual({
				touched: true,
				dirty: true,
				issues: [{ message: 'Enter an email', path: ['email'] }]
			});
	});

	it('resets each field in TanStack on a native reset', async () => {
		render(TanstackFieldHarness);
		await userEvent.fill(page.getByTestId('email'), 'nope');
		await userEvent.fill(page.getByTestId('age'), '41');
		await userEvent.click(page.getByTestId('agree'));
		await userEvent.click(page.getByTestId('kit'));
		await expect.poll(() => text('email-error')).toBe('Enter an email');

		await page.getByRole('button', { name: 'Reset' }).click();

		await expect.poll(() => json('values')).toEqual(defaults);
		expect(input('email').value).toBe('ada@example.com');
		expect(input('age').value).toBe('36');
		expect(input('agree').checked).toBe(false);
		expect(input('kit').checked).toBe(false);
		expect(input('svelte').checked).toBe(true);
		expect(json('email-meta')).toEqual({ touched: false, dirty: false, issues: [] });
		await expect.poll(() => text('email-error')).toBe('');
		expect(input('email').getAttribute('aria-invalid')).toBe(null);
	});

	it('shows a field-level onChangeAsync error in Field.Error and blocks the submit', async () => {
		render(TanstackAsyncHarness);
		const submit = page.getByRole('button', { name: 'Submit' });

		await userEvent.fill(page.getByTestId('username'), 'alice');
		await expect.poll(() => text('error')).toBe('alice is not available.');
		await expect.element(page.getByTestId('username')).toHaveAttribute('aria-invalid', 'true');
		await expect.element(page.getByTestId('username')).toHaveAccessibleName('Username');

		await submit.click();
		await expect.poll(() => json('submission')).toEqual({ attempts: 1, submitting: false });
		expect(json('submitted')).toEqual([]);

		await userEvent.fill(page.getByTestId('username'), 'grace');
		await expect.poll(() => text('error')).toBe('');
		await submit.click();
		await expect.poll(() => json('submitted')).toEqual(['grace']);
	});
});
