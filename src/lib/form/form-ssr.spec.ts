// Base UI renders `noValidate` on the server. The port sets it after hydration instead,
// so a page without JavaScript keeps the browser's constraint validation.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Form from './Form.svelte';

describe('Form SSR', () => {
	it('renders no novalidate attribute', () => {
		const body = render(Form).body;

		expect(body).toContain('<form');
		expect(body).not.toContain('novalidate');
	});
});
