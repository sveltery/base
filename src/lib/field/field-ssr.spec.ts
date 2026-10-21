// Field parts rendered on the server outside `<Field.Root>`, against upstream's default LabelableContext.
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../checkbox/index.js';
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

	it('does not carry a standalone label into the next standalone control', () => {
		void render(Field.Label, { props: { id: 'leaked-label' } }).body;
		expect(html(render(Field.Control, { props: { id: 'email' } }).body)).toBe(
			'<input id="email"/>'
		);
	});

	it('keeps an author aria-describedby on a standalone checkbox', () => {
		const body = html(
			render(Checkbox.Root, { props: { id: 'cb', 'aria-describedby': 'hint' } }).body
		);
		expect(body).toContain(
			'<span role="checkbox" tabindex="0" data-unchecked="" id="base-ui-s1" aria-checked="false" aria-describedby="hint">'
		);
	});

	it('renders nothing for a Field.Error with no Field.Root, and warns', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		expect(html(render(Field.Error, { props: { match: true, id: 'err' } }).body)).toBe('');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('Form.Error'));
		warn.mockRestore();
	});
});
