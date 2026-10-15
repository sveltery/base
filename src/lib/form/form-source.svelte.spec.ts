// Form and Field bound to a form source. No Base UI equivalent: the source is a stand-in for a
// SvelteKit remote form (src/tests/fake-form-source.svelte.ts), so no Kit server runs.
import { page, userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { resetLogged } from '@sveltery/utils';
import BoundFormHarness from '../../tests/BoundFormHarness.svelte';
import FormSuccessionHarness from '../../tests/FormSuccessionHarness.svelte';
import { FakeSource } from '../../tests/fake-form-source.svelte.js';
import type { EnhanceInstance, FormIssue } from './source.js';

type Values = Record<string, unknown>;

const schema = (values: Values): FormIssue[] => [
	...(values.name ? [] : [{ path: ['name'], message: 'Name is required' }]),
	...(typeof values.age === 'number' ? [] : [{ path: ['age'], message: 'Age is required' }])
];

const nameTaken = (values: Values): FormIssue[] =>
	values.name === 'taken' ? [{ path: ['name'], message: 'Name taken' }] : [];

const submit = () => page.getByRole('button', { name: 'Submit' }).click();
const control = (testId: string) => page.getByTestId(testId);
const element = (testId: string) => control(testId).element() as HTMLInputElement;
const remoteAction = '?/remote=fake';
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 20));

function listed(testId: string) {
	return Array.from(control(testId).element().querySelectorAll('li'), (item) => item.textContent);
}

async function fillValid() {
	await userEvent.fill(control('name'), 'Ada');
	await userEvent.fill(control('age'), '36');
}

afterEach(() => {
	resetLogged();
	vi.restoreAllMocks();
});

describe('Form with a source', () => {
	describe('server issues', () => {
		it('shows an issue after a round trip, focuses its control and hides it once the value changes', async () => {
			const source = new FakeSource({ server: nameTaken });
			render(BoundFormHarness, { source });
			await userEvent.fill(control('name'), 'taken');
			await userEvent.fill(control('age'), '36');
			await submit();

			await expect.element(control('name-error')).toHaveTextContent('Name taken');
			await expect.element(control('name')).toHaveFocus();
			expect(element('name').getAttribute('aria-invalid')).toBe('true');
			expect(source.requests).toEqual([{ name: 'taken', age: 36 }]);

			await userEvent.type(control('name'), 'x');
			await expect.element(control('name-error')).not.toBeInTheDocument();
			expect(element('name').hasAttribute('aria-invalid')).toBe(false);
		});

		it('never blocks a resubmit and shows the issue again when the server repeats it', async () => {
			const source = new FakeSource({ server: nameTaken });
			render(BoundFormHarness, { source });
			await userEvent.fill(control('name'), 'taken');
			await userEvent.fill(control('age'), '36');
			await submit();
			await expect.element(control('name-error')).toHaveTextContent('Name taken');

			await submit();
			await expect.poll(() => source.requests.length).toBe(2);
			await expect.element(control('name-error')).toHaveTextContent('Name taken');

			await userEvent.fill(control('name'), 'taken!');
			await expect.element(control('name-error')).not.toBeInTheDocument();
			await userEvent.fill(control('name'), 'taken');
			await expect.element(control('name-error')).not.toBeInTheDocument();
			await submit();
			await expect.poll(() => source.requests.length).toBe(3);
			await expect.element(control('name-error')).toHaveTextContent('Name taken');
		});

		it('keeps an edited server issue hidden when a native constraint blocks the next submit', async () => {
			const source = new FakeSource({ server: nameTaken });
			render(BoundFormHarness, { source, required: true });
			await userEvent.fill(control('name'), 'taken');
			await userEvent.fill(control('age'), '36');
			await submit();
			await expect.element(control('name-error')).toHaveTextContent('Name taken');

			await userEvent.clear(control('name'));
			await submit();

			await expect.element(control('name-error')).toHaveTextContent('Please fill out this field.');
			expect(control('name-error').element().textContent).not.toContain('Name taken');
			expect(source.requests).toEqual([{ name: 'taken', age: 36 }]);
		});

		it('keeps an edited server issue hidden while the next submit is in flight', async () => {
			let answer: (() => void) | undefined;
			const source = new FakeSource({
				server: async (values) => {
					await new Promise<void>((resolve) => (answer = resolve));
					return nameTaken(values);
				}
			});
			const answerServer = async () => {
				await expect.poll(() => answer).toBeTypeOf('function');
				answer!();
				answer = undefined;
			};
			render(BoundFormHarness, { source });
			await userEvent.fill(control('name'), 'taken');
			await userEvent.fill(control('age'), '36');
			await submit();
			await answerServer();
			await expect.element(control('name-error')).toHaveTextContent('Name taken');

			await userEvent.type(control('name'), 'x');
			await expect.element(control('name-error')).not.toBeInTheDocument();
			await submit();
			await expect.poll(() => answer).toBeTypeOf('function');

			expect(source.pending).toBe(1);
			expect(control('name-error').query()).toBe(null);
			await answerServer();
			await expect.poll(() => source.pending).toBe(0);
			expect(control('name-error').query()).toBe(null);
		});

		it('shows a client issue with the text of a hidden server issue once a submit fails on it', async () => {
			const source = new FakeSource({
				schema: (values) =>
					String(values.name).includes('!') ? [{ path: ['name'], message: 'Invalid name' }] : [],
				server: (values) =>
					values.name === 'taken' ? [{ path: ['name'], message: 'Invalid name' }] : []
			});
			render(BoundFormHarness, { source });
			await userEvent.fill(control('name'), 'taken');
			await userEvent.fill(control('age'), '36');
			await submit();
			await expect.element(control('name-error')).toHaveTextContent('Invalid name');

			await userEvent.type(control('name'), '!');
			await expect.element(control('name-error')).not.toBeInTheDocument();
			await submit();

			await expect.element(control('name-error')).toHaveTextContent('Invalid name');
			expect(source.requests).toEqual([{ name: 'taken', age: 36 }]);
		});

		it('focuses the first control with an issue once the round trip ends', async () => {
			const source = new FakeSource({
				server: () => [{ path: ['age'], message: 'Too young' }]
			});
			render(BoundFormHarness, { source });
			await fillValid();
			await submit();

			await expect.element(control('age-error')).toHaveTextContent('Too young');
			await expect.element(control('age')).toHaveFocus();
			expect(control('name-error').query()).toBe(null);
		});
	});

	describe('submit gate', () => {
		it('keeps a submit blocked on a native constraint from the server while the source sees it', async () => {
			const source = new FakeSource();
			render(BoundFormHarness, { source, required: true });
			await submit();

			await expect.element(control('name-error')).toHaveTextContent('Please fill out this field.');
			await expect.element(control('name')).toHaveFocus();
			await nextTask();
			expect(source.requests).toEqual([]);
			expect(source.submitted).toBe(true);
		});

		it('does not move focus later after a submit the source left to the browser', async () => {
			const source = new FakeSource({ schema });
			render(BoundFormHarness, { source, mode: 'onChange' });
			const form = control('form').element() as HTMLFormElement;
			const external = document.createElement('button');
			external.setAttribute('formtarget', '_blank');
			form.append(external);
			const stopNavigation = (event: Event) => event.preventDefault();
			document.addEventListener('submit', stopNavigation);
			try {
				form.requestSubmit(external);
				await nextTask();
				expect(source.pending).toBe(0);

				await userEvent.fill(control('age'), '36');
				await expect.element(control('name-error')).toHaveTextContent('Name is required');
				await nextTask();
				expect(document.activeElement).toBe(element('age'));
			} finally {
				document.removeEventListener('submit', stopNavigation);
			}
		});
	});

	describe('bound control props', () => {
		it("does not read the source's aria-invalid, so an issue change leaves the control's props alone", async () => {
			const source = new FakeSource({ schema });
			render(BoundFormHarness, { source, mode: 'onChange' });
			const as = vi.spyOn(source.fields.name, 'as');

			await userEvent.fill(control('age'), '36');
			await expect
				.poll(() => source.fields.name.issues())
				.toEqual([{ path: ['name'], message: 'Name is required' }]);

			expect(as).not.toHaveBeenCalled();
			expect(element('name').name).toBe('name/fake');
		});
	});

	describe('validation mode', () => {
		it('onChange shows a schema issue once its field is dirty, not for fields the user has not reached', async () => {
			const source = new FakeSource({ schema });
			render(BoundFormHarness, { source, mode: 'onChange' });

			await userEvent.fill(control('name'), 'a');
			await userEvent.clear(control('name'));

			await expect.element(control('name-error')).toHaveTextContent('Name is required');
			expect(source.fields.age.issues()).toEqual([{ path: ['age'], message: 'Age is required' }]);
			expect(control('age-error').query()).toBe(null);
		});

		it('onBlur shows a schema issue once its field is touched', async () => {
			const source = new FakeSource({ schema });
			render(BoundFormHarness, { source, mode: 'onBlur' });

			await userEvent.click(control('name'));
			await expect.element(control('name-error')).not.toBeInTheDocument();
			await userEvent.tab();

			await expect.element(control('name-error')).toHaveTextContent('Name is required');
			expect(source.fields.age.issues()).toEqual([{ path: ['age'], message: 'Age is required' }]);
			expect(control('age-error').query()).toBe(null);
		});

		it('onSubmit shows nothing while typing and every schema issue after a submit', async () => {
			const source = new FakeSource({ schema });
			render(BoundFormHarness, { source });

			await userEvent.fill(control('name'), 'a');
			await userEvent.clear(control('name'));
			await nextTask();
			expect(control('name-error').query()).toBe(null);

			await submit();
			await expect.element(control('name-error')).toHaveTextContent('Name is required');
			await expect.element(control('age-error')).toHaveTextContent('Age is required');
			await expect.element(control('name')).toHaveFocus();
			expect(source.requests).toEqual([]);

			await userEvent.fill(control('name'), 'Ada');
			await expect.element(control('name-error')).not.toBeInTheDocument();
			expect(control('age-error').element().textContent).toBe('Age is required');
		});
	});

	describe('Form.Error', () => {
		it('shows root and unclaimed issues as an alert, and leaves claimed ones to their Field', async () => {
			const source = new FakeSource({
				server: () => [
					{ path: [], message: 'Wrong password' },
					{ path: ['email'], message: 'Email taken' },
					{ path: ['name'], message: 'Name taken' }
				]
			});
			render(BoundFormHarness, { source });
			expect(control('form-error').query()).toBe(null);
			await fillValid();
			await submit();

			await expect.element(control('name-error')).toHaveTextContent('Name taken');
			expect(listed('form-error')).toEqual(['Wrong password', 'Email taken']);
			expect(page.getByRole('alert').element()).toBe(control('form-error').element());
		});

		it('takes another role from its props', async () => {
			const source = new FakeSource({ server: () => [{ path: [], message: 'Wrong password' }] });
			render(BoundFormHarness, { source, errorRole: 'status' });
			await fillValid();
			await submit();

			await expect.element(control('form-error')).toHaveTextContent('Wrong password');
			expect(control('form-error').element().getAttribute('role')).toBe('status');
		});

		it('shows issues present at mount before any submit', async () => {
			const source = new FakeSource({
				initialIssues: [
					{ path: [], message: 'Wrong password' },
					{ path: ['name'], message: 'Name taken' }
				]
			});
			render(BoundFormHarness, { source });

			await expect.element(control('form-error')).toHaveTextContent('Wrong password');
			await expect.element(control('name-error')).toHaveTextContent('Name taken');
		});

		it('hides issues the source found ahead of a submit for fields that have no Field', async () => {
			const source = new FakeSource({
				schema: (values) => [...schema(values), { path: ['email'], message: 'Email is required' }]
			});
			render(BoundFormHarness, { source, mode: 'onChange' });
			await userEvent.fill(control('name'), 'a');
			await userEvent.clear(control('name'));

			await expect.element(control('name-error')).toHaveTextContent('Name is required');
			expect(control('form-error').query()).toBe(null);
		});

		it('shows `errors` entries no Field has, without a source', async () => {
			render(BoundFormHarness, { errors: { name: 'Name taken', terms: 'Accept the terms' } });

			await expect.element(control('form-error')).toHaveTextContent('Accept the terms');
			await expect.element(control('name-error')).toHaveTextContent('Name taken');
		});
	});

	describe('name resolution', () => {
		const nicknameRequired = (values: Values): FormIssue[] =>
			values.nickname ? [] : [{ path: ['nickname'], message: 'Nickname required' }];

		it('binds `<Field.Root name>` to the source field of that path', async () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const source = new FakeSource({ server: nicknameRequired });
			render(BoundFormHarness, { source, byName: 'nickname' });

			expect(element('named').getAttribute('name')).toBe('nickname/fake');
			await fillValid();
			await submit();

			await expect.element(control('named-error')).toHaveTextContent('Nickname required');
			expect(control('form-error').query()).toBe(null);
			expect(warn).not.toHaveBeenCalled();
		});

		it('warns when an issue lands on another path while a Field is bound by name', async () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const source = new FakeSource({ server: nicknameRequired });
			render(BoundFormHarness, { source, byName: 'nickame' });

			expect(element('named').getAttribute('name')).toBe('nickame/fake');
			await userEvent.fill(control('named'), 'Countess');
			await fillValid();
			await submit();

			await expect.element(control('form-error')).toHaveTextContent('Nickname required');
			expect(control('named-error').query()).toBe(null);
			expect(warn.mock.calls).toEqual([
				[
					'Base UI: an issue on `nickname` has no <Field.Root> to show it, while <Field.Root name> resolved `nickame` through the form. A misspelled `name` submits under the wrong key.'
				]
			]);
		});
	});

	describe('Field.Control', () => {
		it('takes the encoded name, type and value from the source', async () => {
			const source = new FakeSource();
			render(BoundFormHarness, { source });

			expect(element('name').getAttribute('name')).toBe('name/fake');
			expect(element('age').getAttribute('name')).toBe('n:age/fake');
			expect(element('age').type).toBe('number');

			source.fields.name.set('Ada' as never);
			await expect.element(control('name')).toHaveValue('Ada');
			await userEvent.fill(control('age'), '36');
			expect(source.fields.age.value()).toBe(36);
		});

		it('passes the bound props to a `render` snippet', async () => {
			const source = new FakeSource({ server: () => [{ path: ['bio'], message: 'Too short' }] });
			render(BoundFormHarness, { source, bio: true });
			const bio = control('bio').element() as HTMLTextAreaElement;

			expect(bio.tagName).toBe('TEXTAREA');
			expect(bio.getAttribute('name')).toBe('bio/fake');
			expect(page.getByRole('textbox', { name: 'Bio' }).element()).toBe(bio);

			source.fields.bio.set('Hello' as never);
			await expect.element(control('bio')).toHaveValue('Hello');
			await userEvent.fill(control('bio'), 'Hi');
			expect(source.fields.bio.value()).toBe('Hi');

			await fillValid();
			await submit();
			await expect.element(control('bio-error')).toHaveTextContent('Too short');
			expect(bio.getAttribute('aria-invalid')).toBe('true');
		});
	});

	describe('reset', () => {
		it('hides issues for fields the user has not reached again', async () => {
			const source = new FakeSource({ schema });
			render(BoundFormHarness, { source, mode: 'onBlur' });
			await submit();
			await expect.element(control('age-error')).toHaveTextContent('Age is required');

			await page.getByRole('button', { name: 'Reset' }).click();
			await expect.element(control('age-error')).not.toBeInTheDocument();
			await expect.element(control('name-error')).not.toBeInTheDocument();

			await userEvent.fill(control('name'), 'Ada');
			await userEvent.tab();
			await expect
				.poll(() => source.fields.age.issues())
				.toEqual([{ path: ['age'], message: 'Age is required' }]);
			expect(control('age-error').query()).toBe(null);
			expect(control('name-error').query()).toBe(null);
		});

		it('waits for a new edit before showing an onChange issue again', async () => {
			const source = new FakeSource({ schema });
			render(BoundFormHarness, { source, mode: 'onChange' });
			await userEvent.fill(control('name'), 'a');
			await userEvent.clear(control('name'));
			await expect.element(control('name-error')).toHaveTextContent('Name is required');

			await page.getByRole('button', { name: 'Reset' }).click();
			await expect.element(control('name-error')).not.toBeInTheDocument();
			await userEvent.fill(control('age'), '36');

			await expect
				.poll(() => source.fields.name.issues())
				.toEqual([{ path: ['name'], message: 'Name is required' }]);
			expect(control('name-error').query()).toBe(null);
		});

		it('resets once after a successful submit', async () => {
			const source = new FakeSource({ action: remoteAction });
			render(BoundFormHarness, { source });
			await fillValid();
			await submit();

			await expect.element(control('name')).toHaveValue('');
			await nextTask();
			expect(source.requests).toEqual([{ name: 'Ada', age: 36 }]);
			expect(control('resets').element().textContent).toBe('1');
		});
	});

	describe('enhance', () => {
		it('receives the submit instance and replaces the reset on success', async () => {
			const source = new FakeSource();
			const enhance = vi.fn(
				async (instance: { element: HTMLFormElement; submit(): Promise<boolean> }) => {
					expect(instance.element).toBe(control('form').element());
					expect(await instance.submit()).toBe(true);
				}
			);
			render(BoundFormHarness, { source, enhance });
			await fillValid();
			await submit();

			await expect.poll(() => source.requests).toEqual([{ name: 'Ada', age: 36 }]);
			await nextTask();
			expect(enhance).toHaveBeenCalledTimes(1);
			expect(element('name').value).toBe('Ada');
			expect(control('resets').element().textContent).toBe('0');
		});

		it('still tells server issues apart, so an edit hides them', async () => {
			const source = new FakeSource({ server: nameTaken });
			render(BoundFormHarness, {
				source,
				enhance: async (instance) => {
					await instance.submit();
				}
			});
			await userEvent.fill(control('name'), 'taken');
			await userEvent.fill(control('age'), '36');
			await submit();
			await expect.element(control('name-error')).toHaveTextContent('Name taken');

			await userEvent.type(control('name'), 'x');
			await expect.element(control('name-error')).not.toBeInTheDocument();
		});

		it("keeps a later Form's callback when an earlier Form on the same source unmounts", async () => {
			const source = new FakeSource();
			const elements: HTMLFormElement[] = [];
			const enhance = async (instance: EnhanceInstance) => {
				elements.push(instance.element);
				await instance.submit();
			};
			render(FormSuccessionHarness, { source, enhance });
			await page.getByRole('button', { name: 'Mount second' }).click();
			await page.getByRole('button', { name: 'Unmount first' }).click();

			await page.getByRole('button', { name: 'Submit second' }).click();
			await expect.poll(() => source.requests).toEqual([{}]);
			expect(elements).toEqual([control('second').element()]);
		});
	});

	it('warns that onFormSubmit runs alongside a source submit', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		render(BoundFormHarness, { source: new FakeSource(), onFormSubmit: () => {} });

		await expect
			.poll(() => warn.mock.calls)
			.toEqual([
				[
					'Base UI: <Form form> submits through its source, so `onFormSubmit` runs alongside that submit. Use `enhance` to customize a source submit.'
				]
			]);
	});
});
