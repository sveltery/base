// Composite controls inside a Field bound to a form source. No Base UI equivalent: the source is
// a stand-in for a SvelteKit remote form, with Kit's name encoding and `input` handling.
import { flushSync } from 'svelte';
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { resetLogged } from '@sveltery/utils';
import BoundControlHarness from '../../tests/BoundControlHarness.svelte';
import { FakeRemoteForm } from '../../tests/fake-remote-form.svelte.js';

function form() {
	return page.getByTestId('form').element() as HTMLFormElement;
}

function names() {
	return Array.from(form().querySelectorAll('input[name]'), (input) => input.getAttribute('name'));
}

function submitted(source: FakeRemoteForm) {
	return source.decode(new FormData(form()));
}

afterEach(() => {
	resetLogged();
	vi.restoreAllMocks();
});

describe('bound Checkbox and Switch', () => {
	for (const [scenario, path] of [
		['checkbox', 'agree'],
		['switch', 'alerts']
	] as const) {
		describe(scenario, () => {
			it('submits a boolean under the encoded name, with no unchecked value', async () => {
				const source = new FakeRemoteForm();
				render(BoundControlHarness, { source, scenario });

				expect(names()).toEqual([`b:${path}/fake`]);
				expect(form().querySelector('input[name]')?.hasAttribute('value')).toBe(false);
				expect(submitted(source)).toEqual({});

				await page.getByTestId('control').click();
				await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'true');
				expect(submitted(source)).toEqual({ [path]: true });
				expect(source.input[path]).toBe(true);

				await page.getByTestId('control').click();
				expect(source.input[path]).toBe(false);
				expect(submitted(source)).toEqual({});
			});

			it('follows a value set on the source', async () => {
				const source = new FakeRemoteForm();
				render(BoundControlHarness, { source, scenario });

				source.field(path).set(true as never);
				await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'true');
				expect(submitted(source)).toEqual({ [path]: true });

				source.field(path).set(false as never);
				await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'false');
				expect(submitted(source)).toEqual({});
			});

			it('starts from the source value, and a reset restores the default', async () => {
				const source = new FakeRemoteForm('fake', { [path]: true });
				render(BoundControlHarness, { source, scenario });

				await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'true');
				expect(submitted(source)).toEqual({ [path]: true });

				form().reset();
				await expect.element(page.getByTestId('control')).toHaveAttribute('aria-checked', 'false');
				expect(submitted(source)).toEqual({});
				expect(source.input[path]).toBe(undefined);
			});
		});
	}
});

describe('dev kind check', () => {
	for (const [scenario, kind, declared] of [
		['checkbox', 'checkbox', 'switch'],
		['switch', 'switch', 'checkbox']
	] as const) {
		it(`logs when a ${kind} control sits in a Field declared as ${declared}`, async () => {
			const log = vi.spyOn(console, 'error').mockImplementation(() => {});
			render(BoundControlHarness, { source: new FakeRemoteForm(), scenario, type: declared });
			flushSync();
			await expect
				.poll(() => log.mock.calls.map((call) => call[0]))
				.toEqual([
					`Base UI: A ${kind} control is inside a Field.Root declared as type="${declared}". ` +
						`Set type="${kind}" on the Field.Root, or use a control of kind "${declared}".`
				]);
		});
	}

	it('stays quiet when the kinds agree', async () => {
		const log = vi.spyOn(console, 'error').mockImplementation(() => {});
		const source = new FakeRemoteForm();
		render(BoundControlHarness, { source, scenario: 'switch' });
		await page.getByTestId('control').click();
		expect(source.input.alerts).toBe(true);
		expect(log.mock.calls).toEqual([]);
	});
});

void userEvent;
