// React Base UI 1.8.0 counterpart of InputFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ComponentProps } from 'react';
import { createRoot } from 'react-dom/client';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Input } from '@base-ui/react/input';
import type { InputCase } from './cases.js';

// Base UI's public prop types omit `data-*`. The attributes still reach the DOM.
type FixtureProps<T> = T & { 'data-testid'?: string };
function rootProps(props: FixtureProps<ComponentProps<typeof Field.Root>>) {
	return props;
}
function labelProps(props: FixtureProps<ComponentProps<typeof Field.Label>>) {
	return props;
}
function inputProps(props: FixtureProps<ComponentProps<typeof Input>>) {
	return props;
}
function errorProps(props: FixtureProps<ComponentProps<typeof Field.Error>>) {
	return props;
}

export function mountInputReference(node: HTMLElement, scenario: InputCase, onReady: () => void) {
	function App() {
		const [value, setValue] = useState('a');
		const [submitted, setSubmitted] = useState(0);
		const [values, setValues] = useState('');
		useEffect(onReady, []);

		let body;
		if (scenario === 'plain') {
			body = h(
				Field.Root,
				null,
				h(Input, inputProps({ id: 'tested-input', placeholder: 'Name', 'data-testid': 'control' }))
			);
		} else if (scenario === 'labelled') {
			body = h(
				Field.Root,
				rootProps({ 'data-testid': 'field' }),
				h(Field.Label, labelProps({ 'data-testid': 'label' }), 'Email'),
				h(Input, inputProps({ 'data-testid': 'control' }))
			);
		} else if (scenario === 'bound') {
			body = h(
				Fragment,
				null,
				h(
					Field.Root,
					null,
					h(
						Input,
						inputProps({
							value,
							onValueChange: (next) => setValue(next),
							'data-testid': 'control'
						})
					)
				),
				h('output', { 'data-testid': 'value' }, value)
			);
		} else if (scenario === 'disabled') {
			body = h(
				Field.Root,
				rootProps({ disabled: true, 'data-testid': 'field' }),
				h(Field.Label, null, 'Email'),
				h(Input, inputProps({ 'data-testid': 'control' }))
			);
		} else if (scenario === 'invalid') {
			body = h(
				Field.Root,
				rootProps({ invalid: true, 'data-testid': 'field' }),
				h(Input, inputProps({ 'data-testid': 'control' }))
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
						h(Input, inputProps({ required: true, 'data-testid': 'control' })),
						h(Field.Error, errorProps({ 'data-testid': 'error' }), 'Required')
					),
					h('button', { type: 'submit' }, 'Submit')
				),
				h('output', { 'data-testid': 'submitted' }, String(submitted))
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
						h(Input, inputProps({ defaultValue: 'ada', 'data-testid': 'control' }))
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
