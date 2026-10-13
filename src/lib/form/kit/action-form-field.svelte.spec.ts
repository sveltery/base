// actionForm inside Form and Field, against the stand-in for `use:enhance`.
import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ActionFormFieldHarness from '../../../tests/ActionFormFieldHarness.svelte';
import { resetServer, server } from '../../../tests/kit-forms-mock.svelte.js';

vi.mock('$app/forms', async () => {
	const { enhance } = await import('../../../tests/kit-forms-mock.svelte.js');
	return { enhance };
});
vi.mock('$app/state', async () => {
	const { page } = await import('../../../tests/kit-forms-mock.svelte.js');
	return { page };
});

/** An error part renders nothing while it has no message. */
function text(testId: string) {
	return document.querySelector(`[data-testid="${testId}"]`)?.textContent?.trim() ?? '';
}

function input(testId: string) {
	return page.getByTestId(testId).element() as HTMLInputElement;
}

const submit = () => page.getByRole('button', { name: 'Submit' }).click();

function taken(input: Record<string, unknown>) {
	return {
		type: 'failure' as const,
		status: 400,
		location: '/',
		data: {
			action: 'default',
			input,
			issues: [
				{ path: ['email'], message: 'Email already taken' },
				{ path: [], message: 'Try again later' }
			]
		}
	};
}

beforeEach(resetServer);

describe('actionForm in Form and Field', () => {
	it('shows schema issues per field and focuses the first, with no request', async () => {
		render(ActionFormFieldHarness);
		await userEvent.fill(page.getByTestId('email'), 'ada@example.com');
		await userEvent.fill(page.getByTestId('age'), '12');
		await submit();

		await expect.poll(() => text('name-error')).toBe('Name is required');
		expect(text('age-error')).toBe('At least 18');
		expect(text('email-error')).toBe('');
		await expect.element(page.getByTestId('name')).toHaveFocus();
		expect(input('name').getAttribute('aria-invalid')).toBe('true');
		expect(server.requests).toEqual([]);
	});

	it('shows server issues, hides one once its field changes, and never blocks a resubmit', async () => {
		server.respond = (data) => taken(Object.fromEntries(data));
		render(ActionFormFieldHarness);
		await userEvent.fill(page.getByTestId('email'), 'ada@example.com');
		await userEvent.fill(page.getByTestId('name'), 'Ada');
		await userEvent.fill(page.getByTestId('age'), '36');
		await submit();

		await expect.poll(() => text('email-error')).toBe('Email already taken');
		expect(text('form-error')).toBe('Try again later');
		await expect.element(page.getByTestId('email')).toHaveFocus();

		await userEvent.fill(page.getByTestId('email'), 'grace@example.com');
		await expect.poll(() => text('email-error')).toBe('');

		await submit();
		await expect.poll(() => server.requests.length).toBe(2);
		expect(server.requests[1]).toEqual([
			['email', 'grace@example.com'],
			['name', 'Ada'],
			['n:age', '36']
		]);
	});

	it('renders the echo and issues of a submit made without JavaScript', async () => {
		server.form = taken({ email: 'ada@example.com', name: 'Ada', age: 36 }).data;
		render(ActionFormFieldHarness);

		expect(input('email').value).toBe('ada@example.com');
		expect(input('age').value).toBe('36');
		expect(text('email-error')).toBe('Email already taken');
		expect(text('form-error')).toBe('Try again later');
	});

	it('shows the result and resets after a successful submit', async () => {
		server.respond = () => ({
			type: 'success',
			status: 200,
			data: { welcome: 'Ada' },
			location: '/'
		});
		render(ActionFormFieldHarness);
		await userEvent.fill(page.getByTestId('email'), 'ada@example.com');
		await userEvent.fill(page.getByTestId('name'), 'Ada');
		await userEvent.fill(page.getByTestId('age'), '36');
		await submit();

		await expect.poll(() => text('result')).toBe('Welcome, Ada');
		await expect.poll(() => input('email').value).toBe('');
		expect(input('age').value).toBe('');
	});

	it('shows a schema issue once the field is left in onBlur mode', async () => {
		render(ActionFormFieldHarness, { mode: 'onBlur' });
		await userEvent.fill(page.getByTestId('name'), 'Ada');
		await userEvent.fill(page.getByTestId('age'), '12');
		expect(text('age-error')).toBe('');

		await userEvent.click(page.getByTestId('email'));
		await expect.poll(() => text('age-error')).toBe('At least 18');
		expect(text('email-error')).toBe('');
	});
});
