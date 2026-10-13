// `onFocusInvalid` on a multi-step form whose inactive step is hidden. No Base UI equivalent.
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormRevealHarness from '../../tests/FormRevealHarness.svelte';
import { FakeSource } from '../../tests/fake-form-source.svelte.js';
import type { FormIssue } from './source.js';

const nameTaken = (values: Record<string, unknown>): FormIssue[] =>
	values.name === 'taken' ? [{ path: ['name'], message: 'Name taken' }] : [];

const submit = () => page.getByRole('button', { name: 'Submit' }).click();
const control = (testId: string) => page.getByTestId(testId);
const input = (testId: string) => control(testId).element() as HTMLInputElement;
const text = (testId: string) => control(testId).element().textContent;

async function submitFromStepTwo(name: string) {
	await userEvent.fill(control('name'), name);
	await page.getByRole('button', { name: 'Next' }).click();
	await userEvent.fill(control('email'), 'ada@example.com');
	await submit();
}

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Form onFocusInvalid', () => {
	it('reveals the hidden step of a field that fails a native constraint, then focuses it', async () => {
		render(FormRevealHarness);
		await userEvent.fill(control('name'), 'Ada');
		await submit();

		await expect.element(control('email')).toHaveFocus();
		expect(text('step')).toBe('2');
		expect(text('calls')).toBe('email@1');
	});

	it('waits for an asynchronous reveal before it focuses', async () => {
		const { promise, resolve } = Promise.withResolvers<void>();
		render(FormRevealHarness, { revealAfter: promise });
		await submit();
		await expect.poll(() => text('calls')).toBe('email@1');

		expect(text('step')).toBe('1');
		expect(document.activeElement).not.toBe(input('email'));
		resolve();
		await expect.element(control('email')).toHaveFocus();
		expect(text('step')).toBe('2');
	});

	it('leaves focus where the user moved it while the reveal was pending', async () => {
		const { promise, resolve } = Promise.withResolvers<void>();
		render(FormRevealHarness, { revealAfter: promise });
		await submit();
		await expect.poll(() => text('calls')).toBe('email@1');

		await userEvent.click(control('other'));
		resolve();
		await expect.poll(() => text('step')).toBe('2');
		await expect.element(control('other')).toHaveFocus();
	});

	it('selects an invalid control that already had focus', async () => {
		const select = vi.spyOn(HTMLInputElement.prototype, 'select');
		render(FormRevealHarness);
		await page.getByRole('button', { name: 'Next' }).click();
		await userEvent.fill(control('email'), 'x');
		await userEvent.clear(control('email'));
		await userEvent.keyboard('{Enter}');

		await expect.poll(() => text('calls')).toBe('email@2');
		await expect.element(control('email')).toHaveFocus();
		await expect.poll(() => select.mock.contexts).toEqual([input('email')]);
	});

	it('reveals the step of a field a remote source answers with an issue, once per submit', async () => {
		const source = new FakeSource({ server: nameTaken });
		render(FormRevealHarness, { source });
		await submitFromStepTwo('taken');

		await expect.element(control('name')).toHaveFocus();
		expect(text('step')).toBe('1');
		expect(text('calls')).toBe('name@2');
		expect(source.requests).toEqual([{ name: 'taken', email: 'ada@example.com' }]);
	});

	it('still focuses the control when the callback rejects, and leaves the error unhandled', async () => {
		const reasons: unknown[] = [];
		const catchRejection = (event: PromiseRejectionEvent) => {
			event.preventDefault();
			reasons.push(event.reason);
		};
		window.addEventListener('unhandledrejection', catchRejection);
		try {
			render(FormRevealHarness, { fail: true });
			await userEvent.fill(control('name'), 'Ada');
			await submit();

			await expect.element(control('email')).toHaveFocus();
			expect(text('step')).toBe('2');
			await expect
				.poll(() => reasons.map((reason) => (reason as Error).message))
				.toEqual(['reveal failed']);
		} finally {
			window.removeEventListener('unhandledrejection', catchRejection);
		}
	});

	it('leaves focus and selection to a callback that focused the control', async () => {
		const focus = vi.spyOn(HTMLElement.prototype, 'focus');
		const select = vi.spyOn(HTMLInputElement.prototype, 'select');
		const source = new FakeSource({ server: nameTaken });
		render(FormRevealHarness, { source, focusInCallback: true });
		await submitFromStepTwo('taken');

		await expect.element(control('name')).toHaveFocus();
		await expect.poll(() => text('calls')).toBe('name@2');
		expect([input('name').selectionStart, input('name').selectionEnd]).toEqual([1, 1]);
		expect(focus.mock.contexts.filter((context) => context === input('name'))).toHaveLength(1);
		expect(select).not.toHaveBeenCalled();

		await submit();
		await expect.poll(() => source.requests.length).toBe(2);
		await expect.poll(() => text('calls')).toBe('name@2,name@1');
		expect(focus.mock.contexts.filter((context) => context === input('name'))).toHaveLength(2);
		expect(select).not.toHaveBeenCalled();
	});

	describe('without the callback', () => {
		it('focuses and selects the first invalid control', async () => {
			const select = vi.spyOn(HTMLInputElement.prototype, 'select');
			render(FormRevealHarness, { reveal: false });
			await page.getByRole('button', { name: 'Next' }).click();
			await submit();

			await expect.element(control('email')).toHaveFocus();
			expect(select.mock.contexts).toEqual([input('email')]);
			expect(text('calls')).toBe('');
		});

		it('leaves a hidden step hidden and its control unfocused', async () => {
			render(FormRevealHarness, { reveal: false });
			await submit();

			expect(text('step')).toBe('1');
			expect(document.activeElement).not.toBe(input('email'));
		});
	});
});
