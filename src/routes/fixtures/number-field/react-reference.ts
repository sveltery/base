// React Base UI 1.8.0 counterpart of NumberFieldFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { NumberField } from '@base-ui/react/number-field';
import type { NumberFieldCase } from './cases.js';

type FixtureProps<T> = T & { 'data-testid'?: string };
function rootProps(props: FixtureProps<ComponentProps<typeof NumberField.Root>>) {
	return props;
}
function inputProps(props: FixtureProps<ComponentProps<typeof NumberField.Input>>) {
	return props;
}
function fieldProps(props: FixtureProps<ComponentProps<typeof Field.Root>>) {
	return props;
}
function labelProps(props: FixtureProps<ComponentProps<typeof Field.Label>>) {
	return props;
}
function errorProps(props: FixtureProps<ComponentProps<typeof Field.Error>>) {
	return props;
}

export function mountNumberFieldReference(
	node: HTMLElement,
	scenario: NumberFieldCase,
	onReady: () => void
) {
	const root: Root = createRoot(node);

	function App() {
		const [value, setValue] = useState<number | null>(4);
		const [submitted, setSubmitted] = useState(0);
		useEffect(onReady, []);

		let body;
		if (scenario === 'plain') {
			body = h(
				NumberField.Root,
				rootProps({ locale: 'en-US', defaultValue: 4 }),
				h(
					NumberField.Group,
					null,
					h(NumberField.Decrement),
					h(NumberField.Input, inputProps({ 'data-testid': 'control' })),
					h(NumberField.Increment)
				)
			);
		} else if (scenario === 'labelled') {
			body = h(
				Field.Root,
				fieldProps({ 'data-testid': 'field' }),
				h(Field.Label, labelProps({ 'data-testid': 'label' }), 'Amount'),
				h(
					NumberField.Root,
					rootProps({ locale: 'en-US' }),
					h(NumberField.Input, inputProps({ 'data-testid': 'control' }))
				)
			);
		} else if (scenario === 'bound') {
			body = h(
				Fragment,
				null,
				h(
					NumberField.Root,
					rootProps({
						locale: 'en-US',
						value,
						onValueChange: (next) => setValue(next)
					}),
					h(NumberField.Input, inputProps({ 'data-testid': 'control' })),
					h(NumberField.Increment)
				),
				h('output', { 'data-testid': 'value' }, String(value))
			);
		} else if (scenario === 'formatted') {
			body = h(
				Field.Root,
				fieldProps({ name: 'price' }),
				h(
					NumberField.Root,
					rootProps({
						locale: 'de-DE',
						defaultValue: 54.5,
						format: { style: 'currency', currency: 'EUR' }
					}),
					h(NumberField.Input, inputProps({ 'data-testid': 'control' }))
				)
			);
		} else if (scenario === 'disabled') {
			body = h(
				NumberField.Root,
				rootProps({ locale: 'en-US', defaultValue: 4, disabled: true, 'data-testid': 'root' }),
				h(NumberField.Input, inputProps({ 'data-testid': 'control' })),
				h(NumberField.Increment)
			);
		} else {
			body = h(
				Fragment,
				null,
				h(
					Form,
					{
						onSubmit: (event: { preventDefault: () => void }) => {
							event.preventDefault();
							setSubmitted((count) => count + 1);
						}
					},
					h(
						Field.Root,
						fieldProps({ name: 'qty' }),
						h(
							NumberField.Root,
							rootProps({ required: true }),
							h(NumberField.Input, inputProps({ 'data-testid': 'control' }))
						),
						h(
							Field.Error,
							errorProps({ match: 'valueMissing', 'data-testid': 'error' }),
							'Required'
						)
					),
					h('button', { type: 'submit' }, 'Submit')
				),
				h('output', { 'data-testid': 'submitted' }, String(submitted))
			);
		}

		return body;
	}

	root.render(h(App));
	return () => root.unmount();
}
