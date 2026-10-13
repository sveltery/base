// actionForm against a stand-in for `use:enhance`, so no SvelteKit server runs. The end-to-end
// action scenarios run against a real Kit app in the form fixtures.
import { flushSync } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ActionFormHarness from '../../../tests/ActionFormHarness.svelte';
import { resetServer, server } from '../../../tests/kit-forms-mock.svelte.js';
import type { ActionFormEnhanceCallback } from './index.js';
import type { SignupInput } from '../../../tests/signup-schema.js';

vi.mock('$app/forms', async () => {
	const { enhance } = await import('../../../tests/kit-forms-mock.svelte.js');
	return { enhance };
});

type Callback = ActionFormEnhanceCallback<SignupInput, { welcome: string }>;

function state() {
	return JSON.parse(page.getByTestId('state').element().textContent ?? '{}');
}

function input(testId: string) {
	return page.getByTestId(testId).element() as HTMLInputElement;
}

async function fillValid() {
	await userEvent.fill(page.getByTestId('email'), 'ada@example.com');
	await userEvent.fill(page.getByTestId('name'), 'Ada');
	await userEvent.fill(page.getByTestId('age'), '36');
}

const submit = () => page.getByRole('button', { name: 'Submit' }).click();

function failure(input: Record<string, unknown>, issues: { path: string[]; message: string }[]) {
	return { action: 'default', input, issues };
}

beforeEach(resetServer);

describe('actionForm', () => {
	it('renders the echoed input and issues of its action', async () => {
		server.form = failure({ email: 'nope', age: 12, agree: true, tags: ['kit'] }, [
			{ path: ['email'], message: 'Invalid email' }
		]);
		render(ActionFormHarness);

		expect(input('email').value).toBe('nope');
		expect(input('email').getAttribute('aria-invalid')).toBe('true');
		expect(input('age').value).toBe('12');
		expect(input('agree').checked).toBe(true);
		expect(input('tag-svelte').checked).toBe(false);
		expect(input('tag-kit').checked).toBe(true);
		expect(state().email.issues).toEqual([{ path: ['email'], message: 'Invalid email' }]);
	});

	it("ignores another action's failure", async () => {
		server.form = failure({ email: 'nope' }, [{ path: ['email'], message: 'Invalid email' }]);
		render(ActionFormHarness, { action: 'login' });

		expect(input('email').value).toBe('');
		expect(page.getByTestId('form').element().getAttribute('action')).toBe('?/login');
		expect(state().issues).toEqual([]);
	});

	it('runs the schema before submitting and sends nothing when it fails', async () => {
		render(ActionFormHarness);
		// Values the browser accepts, so the form is not blocked by constraint validation first.
		await userEvent.fill(page.getByTestId('age'), '12');
		await submit();

		await expect
			.poll(() => state().issues)
			.toEqual([
				{ path: ['email'], message: 'Invalid email' },
				{ path: ['name'], message: 'Name is required' },
				{ path: ['age'], message: 'At least 18' }
			]);
		expect(state().submitted).toBe(true);
		expect(state().pending).toBe(0);
		expect(server.requests).toEqual([]);
	});

	it('sends a valid submit, applies the result and resets like Kit by default', async () => {
		server.respond = () => ({
			type: 'success',
			status: 200,
			data: { welcome: 'Ada' },
			location: '/'
		});
		render(ActionFormHarness);
		await fillValid();
		await userEvent.click(page.getByTestId('agree'));
		await userEvent.click(page.getByTestId('tag-kit'));
		await submit();

		await expect.poll(() => state().result).toEqual({ welcome: 'Ada' });
		expect(server.requests).toEqual([
			[
				['email', 'ada@example.com'],
				['name', 'Ada'],
				['n:age', '36'],
				['b:agree', 'on'],
				['tags[]', 'kit'],
				['_password', '']
			]
		]);
		expect(server.updates).toEqual([{ reset: false, refreshAll: undefined }]);
		await expect.poll(() => input('email').value).toBe('');
		await expect.poll(() => state().submitted).toBe(false);
		expect(input('agree').checked).toBe(false);
		expect(state().email).toEqual({ value: '', touched: false, dirty: false, issues: [] });
	});

	it('runs enhance before the request, which is sent only when it calls submit()', async () => {
		const skip = vi.fn<Callback>(() => {});
		render(ActionFormHarness, { enhance: skip });
		await fillValid();
		await submit();

		await expect.poll(() => skip.mock.calls.length).toBe(1);
		await expect.poll(() => state().pending).toBe(0);
		expect(server.requests).toEqual([]);
	});

	it('resolves submit() with the outcome once the result is applied', async () => {
		const outcomes: unknown[] = [];
		server.respond = () => ({
			type: 'failure',
			status: 400,
			data: failure({ email: 'ada@example.com' }, [
				{ path: ['email'], message: 'Email already taken' }
			]),
			location: '/'
		});
		render(ActionFormHarness, {
			enhance: async ({ submit }) => {
				const success = await submit().updates();
				outcomes.push(success, server.form !== undefined);
			}
		});
		await fillValid();
		await submit();

		await expect.poll(() => outcomes).toEqual([false, true]);
		expect(server.updates).toEqual([{ reset: false, refreshAll: false }]);
		expect(state().email.issues).toEqual([{ path: ['email'], message: 'Email already taken' }]);
		expect(input('email').value).toBe('ada@example.com');
	});

	it('holds exactly the server issues when submit() resolves', async () => {
		let release!: () => void;
		server.respond = () =>
			new Promise((resolve) => {
				release = () =>
					resolve({
						type: 'failure',
						status: 400,
						data: failure({ email: 'ada@example.com' }, [
							{ path: ['email'], message: 'Email already taken' }
						]),
						location: '/'
					});
			});
		const atResolution: unknown[] = [];
		const { component } = render(ActionFormHarness, {
			enhance: async ({ submit, fields }) => {
				await submit();
				atResolution.push(fields.allIssues());
			}
		});
		await fillValid();
		await submit();
		await expect.poll(() => state().pending).toBe(1);

		await userEvent.fill(page.getByTestId('name'), '');
		await component.source().validate({ all: true });
		await expect
			.poll(() => state().issues)
			.toEqual([{ path: ['name'], message: 'Name is required' }]);
		release();

		await expect
			.poll(() => atResolution)
			.toEqual([[{ path: ['email'], message: 'Email already taken' }]]);
	});

	it('keeps edits made while the request is in flight', async () => {
		let release!: () => void;
		server.respond = () =>
			new Promise((resolve) => {
				release = () =>
					resolve({
						type: 'failure',
						status: 400,
						data: failure({ email: 'ada@example.com', name: 'Ada', age: 36 }, [
							{ path: ['email'], message: 'Email already taken' }
						]),
						location: '/'
					});
			});
		render(ActionFormHarness);
		await fillValid();
		await submit();
		await expect.poll(() => state().pending).toBe(1);

		await userEvent.fill(page.getByTestId('name'), 'Grace');
		release();

		await expect.poll(() => state().pending).toBe(0);
		await expect.poll(() => state().email.issues.length).toBe(1);
		expect(input('name').value).toBe('Grace');
		expect(state().name.value).toBe('Grace');
	});

	it('dismisses the failure and clears its state on reset', async () => {
		server.form = failure({ email: 'ada@example.com' }, [
			{ path: ['email'], message: 'Email already taken' }
		]);
		render(ActionFormHarness);
		expect(state().email.issues).toEqual([{ path: ['email'], message: 'Email already taken' }]);
		await submit();
		await expect.poll(() => state().submitted).toBe(true);

		await page.getByRole('button', { name: 'Reset' }).click();

		await expect.poll(() => state().issues).toEqual([]);
		expect(state().submitted).toBe(false);
		expect(state().email.value).toBe('');
		expect(input('email').getAttribute('aria-invalid')).toBe(null);
	});

	it('tracks dirty and touched, and validate() shows only fields edited and left', async () => {
		const { component } = render(ActionFormHarness);
		await userEvent.fill(page.getByTestId('email'), 'nope');
		expect(state().email).toMatchObject({ value: 'nope', dirty: true, touched: false });
		await userEvent.click(page.getByTestId('name'));
		expect(state().email.touched).toBe(true);

		await component.source().validate();
		await expect
			.poll(() => state().issues)
			.toEqual([{ path: ['email'], message: 'Invalid email' }]);

		await component.source().validate({ all: true });
		await expect.poll(() => state().issues.length).toBe(3);
	});

	it('writes set() values into the inputs and marks the field', async () => {
		const { component } = render(ActionFormHarness);
		component.source().fields.email.set('set@example.com');
		flushSync();

		expect(input('email').value).toBe('set@example.com');
		expect(state().email).toMatchObject({ dirty: true, touched: true });
	});

	it('spreads only method, action and its attachment onto the form', async () => {
		render(ActionFormHarness, { action: 'login' });
		const form = page.getByTestId('form').element();
		expect(form.getAttributeNames().sort()).toEqual(['action', 'data-testid', 'method']);
		expect(form.getAttribute('method')).toBe('POST');
	});
});
