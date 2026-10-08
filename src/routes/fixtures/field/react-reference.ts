// React Base UI 1.8.0 counterpart of FieldFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, useEffect, useState } from 'react';
import { Field } from '@base-ui/react/field';
import type { FieldCase } from './cases.js';
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
const controlProps = passProps;
const descriptionProps = passProps;
const errorProps = passProps;

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
			body = submittedForm(
				countSubmit(setSubmitted),
				h(
					Field.Root,
					null,
					h(Field.Control, controlProps({ required: true, 'data-testid': 'control' })),
					h(Field.Error, errorProps({ 'data-testid': 'error' }), 'Required')
				),
				submitted
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
			body = valuesForm(
				storeValues(setValues),
				h(
					Field.Root,
					{ name: 'username' },
					h(Field.Control, controlProps({ defaultValue: 'ada', 'data-testid': 'control' }))
				),
				values
			);
		}

		return body;
	}

	return mountApp(node, App);
}
