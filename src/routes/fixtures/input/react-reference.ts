// React Base UI 1.8.0 counterpart of InputFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import type { InputCase } from './cases.js';
import {
	countSubmit,
	mountApp,
	passProps,
	storeValues,
	submittedForm,
	valuesForm
} from '../react-fixture.js';

const rootProps = passProps;
const labelProps = passProps;
const inputProps = passProps;
const errorProps = passProps;

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
			body = submittedForm(
				countSubmit(setSubmitted),
				h(
					Field.Root,
					null,
					h(Input, inputProps({ required: true, 'data-testid': 'control' })),
					h(Field.Error, errorProps({ 'data-testid': 'error' }), 'Required')
				),
				submitted
			);
		} else {
			body = valuesForm(
				storeValues(setValues),
				h(
					Field.Root,
					{ name: 'username' },
					h(Input, inputProps({ defaultValue: 'ada', 'data-testid': 'control' }))
				),
				values
			);
		}

		return body;
	}

	return mountApp(node, App);
}
