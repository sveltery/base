// React Base UI 1.8.0 counterpart of FieldFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ComponentProps } from 'react';
import { createRoot } from 'react-dom/client';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import type { FieldCase } from './cases.js';

// Base UI's public prop types omit `data-*`. The attributes still reach the DOM.
type FixtureProps<T> = T & { 'data-testid'?: string };
function rootProps(props: FixtureProps<ComponentProps<typeof Field.Root>>) {
	return props;
}
function labelProps(props: FixtureProps<ComponentProps<typeof Field.Label>>) {
	return props;
}
function controlProps(props: FixtureProps<ComponentProps<typeof Field.Control>>) {
	return props;
}
function descriptionProps(props: FixtureProps<ComponentProps<typeof Field.Description>>) {
	return props;
}
function errorProps(props: FixtureProps<ComponentProps<typeof Field.Error>>) {
	return props;
}

export function mountFieldReference(node: HTMLElement, scenario: FieldCase, onReady: () => void) {
	function App() {
		const [submitted, setSubmitted] = useState(0);
		const [values, setValues] = useState('');
		useEffect(onReady, []);

		let body;
		if (scenario === 'labelled') {
			body = h(
				Field.Root,
				rootProps({ 'data-testid': 'field' }),
				h(Field.Label, labelProps({ 'data-testid': 'label' }), 'Email'),
				h(Field.Control, controlProps({ 'data-testid': 'control' }))
			);
		} else if (scenario === 'described') {
			body = h(
				Field.Root,
				null,
				h(Field.Control, controlProps({ 'data-testid': 'control', 'aria-describedby': 'author' })),
				h(Field.Description, descriptionProps({ 'data-testid': 'description' }), 'Help')
			);
		} else if (scenario === 'required') {
			body = h(
				Fragment,
				null,
				h(
					Form,
					{
						onSubmit: (event: { preventDefault: () => void }) => {
							event.preventDefault();
							setSubmitted((previous) => previous + 1);
						}
					},
					h(
						Field.Root,
						null,
						h(Field.Control, controlProps({ required: true, 'data-testid': 'control' })),
						h(Field.Error, errorProps({ 'data-testid': 'error' }), 'Required')
					),
					h('button', { type: 'submit' }, 'Submit')
				),
				h('output', { 'data-testid': 'submitted' }, String(submitted))
			);
		} else if (scenario === 'disabled') {
			body = h(
				Field.Root,
				rootProps({ disabled: true, 'data-testid': 'field' }),
				h(Field.Label, null, 'Email'),
				h(Field.Control, controlProps({ 'data-testid': 'control' }))
			);
		} else if (scenario === 'invalid') {
			body = h(
				Field.Root,
				rootProps({ invalid: true, 'data-testid': 'field' }),
				h(Field.Control, controlProps({ 'data-testid': 'control' }))
			);
		} else {
			body = h(
				Fragment,
				null,
				h(
					Form,
					{
						onFormSubmit: (formValues: Record<string, unknown>) => {
							setValues(JSON.stringify(formValues));
						}
					},
					h(
						Field.Root,
						{ name: 'username' },
						h(Field.Control, controlProps({ defaultValue: 'ada', 'data-testid': 'control' }))
					),
					h('button', { type: 'submit' }, 'Submit')
				),
				h('output', { 'data-testid': 'values' }, values)
			);
		}

		return body;
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
