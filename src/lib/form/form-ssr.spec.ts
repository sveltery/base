// The server render of a Form: the constraint gate and a remote form's issues after a failed post,
// which is all a visitor without JavaScript sees.
import type { Component } from 'svelte';
import { render } from 'svelte/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RemoteFormHarness from '../../tests/RemoteFormHarness.svelte';
import Form from './Form.svelte';
import type { FormProps } from './types.js';

const html = (body: string) => body.replace(/<!--.*?-->/g, '');
const tag = (body: string, testId: string) =>
	body.match(new RegExp(`<[a-z]+[^>]*data-testid="${testId}"[^>]*>`))?.[0] ?? '';

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Form SSR', () => {
	it('leaves constraint validation on', () => {
		expect(render(Form).body).not.toMatch(/novalidate/);
	});

	it('renders novalidate when asked', () => {
		// One branch of the props union keeps `render`'s inference small.
		const PlainForm = Form as unknown as Component<Extract<FormProps, { form?: never }>>;
		expect(render(PlainForm, { props: { novalidate: true } }).body).toMatch(/<form[^>]*novalidate/);
	});

	it('renders a remote form issue on the Field named by its path', () => {
		const body = html(
			render(RemoteFormHarness, {
				props: {
					issues: [{ path: ['email'], message: 'Email already taken' }],
					values: { email: 'taken@example.com' }
				}
			}).body
		);

		expect(body).toMatch(/<form[^>]*method="POST"[^>]*action="\?\/remote=form"/);
		expect(tag(body, 'field')).toContain('data-invalid=""');
		expect(tag(body, 'label')).toContain('data-invalid=""');
		const control = tag(body, 'control');
		expect(control).toContain('data-invalid=""');
		expect(control).toContain('aria-invalid="true"');
		expect(control).toContain('name="email/form"');
		expect(control).toContain('value="taken@example.com"');
		const error = body.match(/<div[^>]*data-testid="error"[^>]*>([^<]*)<\/div>/);
		expect(error?.[1]).toBe('Email already taken');
		const errorId = error?.[0].match(/\sid="([^"]+)"/)?.[1];
		expect(control).toMatch(new RegExp(`aria-describedby="[^"]*${errorId}`));
		expect(body).not.toContain('data-testid="form-error"');
	});

	it('renders a form-level issue in Form.Error and lists it on the form', () => {
		const body = html(
			render(RemoteFormHarness, {
				props: { issues: [{ path: [], message: 'Signups are closed' }] }
			}).body
		);
		const formError = body.match(/<div[^>]*data-testid="form-error"[^>]*>([^<]*)<\/div>/);
		expect(formError?.[1]).toBe('Signups are closed');
		const id = formError?.[0].match(/\sid="([^"]+)"/)?.[1];
		expect(body).toMatch(new RegExp(`<form[^>]*aria-describedby="${id}"`));
		expect(tag(body, 'field')).not.toContain('data-invalid');
	});

	it('leaves a nested path to the Field named by it, not a sibling', () => {
		const body = html(
			render(RemoteFormHarness, {
				props: { fieldName: 'name', issues: [{ path: ['email'], message: 'Taken' }] }
			}).body
		);
		expect(tag(body, 'field')).not.toContain('data-invalid');
		expect(body).not.toContain('data-testid="error"');
	});
});

describe('spread checks', () => {
	it('warns on the server when a spread names another field', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		// `render` runs the components when the body is read.
		void render(RemoteFormHarness, {
			props: { fieldName: 'emial', spread: { name: 'email/form', type: 'email' } }
		}).body;
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('<Field.Root name="emial">'));
	});

	it('stays quiet for a spread inside the Field path', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		void render(RemoteFormHarness, {
			props: { fieldName: 'price', spread: { name: 'n:price[0]/form', type: 'number' } }
		}).body;
		void render(RemoteFormHarness, {
			props: { fieldName: 'members', spread: { name: 'members[0].email/form' } }
		}).body;
		expect(warn).not.toHaveBeenCalled();
	});
});
