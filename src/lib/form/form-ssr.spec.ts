// Base UI renders `noValidate` on the server. The port sets it after hydration instead,
// so a page without JavaScript keeps the browser's constraint validation.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import BoundFormHarness from '../../tests/BoundFormHarness.svelte';
import { FakeSource } from '../../tests/fake-form-source.svelte.js';
import Form from './Form.svelte';

describe('Form SSR', () => {
	it('renders no novalidate attribute', () => {
		const body = render(Form).body;

		expect(body).toContain('<form');
		expect(body).not.toContain('novalidate');
	});

	// A page rendered after a submit without JavaScript.
	it('renders field issues on their Field and only root issues in Form.Error', () => {
		const source = new FakeSource({
			initialIssues: [
				{ path: [], message: 'Wrong password' },
				{ path: ['email'], message: 'Email taken' },
				{ path: ['name'], message: 'Name taken' }
			]
		});
		const body = render(BoundFormHarness, { props: { source } }).body;
		const text = (testId: string) =>
			body
				.match(new RegExp(`data-testid="${testId}"[^>]*>(.*?)</div>`, 's'))?.[1]
				.replace(/<!--.*?-->/g, '')
				.trim();

		expect(text('name-error')).toBe('Name taken');
		expect(text('form-error')).toBe('Wrong password');
		expect(body).toContain('role="alert"');
		expect(body).toContain('name="name/fake"');
		expect(body).toContain('name="n:age/fake"');
	});
});
