// React Base UI 1.8.0 counterpart of OTPFieldFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ComponentProps } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { OTPField } from '@base-ui/react/otp-field';
import type { OTPFieldCase } from './cases.js';

type FixtureProps<T> = T & { 'data-testid'?: string };
function rootProps(props: FixtureProps<ComponentProps<typeof OTPField.Root>>) {
	return props;
}
function inputProps(props: FixtureProps<ComponentProps<typeof OTPField.Input>>) {
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

function slots() {
	return [0, 1, 2, 3, 4, 5].map((index) => h(OTPField.Input, inputProps({ key: index })));
}

export function mountOTPFieldReference(
	node: HTMLElement,
	scenario: OTPFieldCase,
	onReady: () => void
) {
	const root: Root = createRoot(node);

	function App() {
		const [value, setValue] = useState('');
		const [submitted, setSubmitted] = useState(0);
		useEffect(onReady, []);

		let body;
		if (scenario === 'plain') {
			body = h(OTPField.Root, rootProps({ length: 6 }), slots());
		} else if (scenario === 'labelled') {
			body = h(
				Field.Root,
				fieldProps({}),
				h(Field.Label, labelProps({ 'data-testid': 'label' }), 'Code'),
				h(OTPField.Root, rootProps({ length: 6 }), slots())
			);
		} else if (scenario === 'bound') {
			body = h(
				Fragment,
				null,
				h(OTPField.Root, rootProps({ length: 6, value, onValueChange: setValue }), slots()),
				h('output', { 'data-testid': 'value' }, value)
			);
		} else if (scenario === 'grouped') {
			body = h(
				OTPField.Root,
				rootProps({ length: 6, defaultValue: '123456', 'data-testid': 'root' }),
				h('div', null, h(OTPField.Input), h(OTPField.Input), h(OTPField.Input)),
				h(OTPField.Separator, null, '-'),
				h('div', null, h(OTPField.Input), h(OTPField.Input), h(OTPField.Input))
			);
		} else if (scenario === 'disabled') {
			body = h(
				OTPField.Root,
				rootProps({ length: 6, disabled: true, 'data-testid': 'root' }),
				slots()
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
						fieldProps({ name: 'otp' }),
						h(OTPField.Root, rootProps({ length: 6, required: true }), slots()),
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
