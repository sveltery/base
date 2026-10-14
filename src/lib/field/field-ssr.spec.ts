// Field parts rendered on the server outside `<Field.Root>`, against upstream's default LabelableContext.
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import FieldHarness from '../../tests/FieldHarness.svelte';
import { Field } from './index.js';

const html = (body: string) => body.replace(/<!--.*?-->/g, '');

describe('Field SSR outside Field.Root', () => {
	it('renders a control with its explicit id', () => {
		expect(html(render(Field.Control, { props: { id: 'email' } }).body)).toBe(
			'<input id="email"/>'
		);
	});

	it('renders a label with the author `for`', () => {
		expect(html(render(Field.Label, { props: { id: 'name-label', for: 'name' } }).body)).toBe(
			'<label for="name" id="name-label"></label>'
		);
	});

	it('renders a label without `for` and a description', () => {
		expect(html(render(FieldHarness, { props: { scenario: 'standalone' } }).body)).toBe(
			'<label data-testid="label" id="email-label">Email</label> <p data-testid="description" id="email-help">We never share it.</p>'
		);
	});
});
