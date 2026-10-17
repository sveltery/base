// Base UI renders `noValidate` on the server, so the server HTML carries `novalidate`.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Form from './Form.svelte';

describe('Form SSR', () => {
	it('renders novalidate', () => {
		const body = render(Form).body;

		expect(body).toMatch(/<form[^>]*novalidate/);
	});
});
