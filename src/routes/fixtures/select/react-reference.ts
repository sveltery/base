// React Base UI 1.9.0 counterpart of SelectFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { Select } from '@base-ui/react/select';
import { fruits, type SelectCase } from './cases.js';

import { mountApp, passProps } from '../react-fixture.js';

const rootProps = passProps;
const partProps = passProps;

function parts() {
	return h(
		Fragment,
		null,
		h(
			Select.Trigger,
			partProps({ 'data-testid': 'control' }),
			h(Select.Value, partProps({ 'data-testid': 'value', placeholder: 'Pick a fruit' })),
			h(Select.Icon)
		),
		h(
			Select.Portal,
			null,
			h(
				Select.Positioner,
				partProps({ 'data-testid': 'positioner' }),
				h(
					Select.Popup,
					partProps({ 'data-testid': 'popup' }),
					Object.entries(fruits).map(([value, label]) =>
						h(
							Select.Item,
							{ key: value, value },
							h(Select.ItemText, partProps({ 'data-testid': `text-${value}` }), label)
						)
					)
				)
			)
		)
	);
}

function select(props: object): ReactNode {
	return h(Select.Root, rootProps({ items: fruits, ...props }), parts());
}

export function mountSelectReference(node: HTMLElement, scenario: SelectCase, onReady: () => void) {
	function App() {
		const [submitted, setSubmitted] = useState(0);
		const [values, setValues] = useState('');
		useEffect(onReady, []);

		if (scenario === 'plain') return select({});
		if (scenario === 'multiple') return select({ multiple: true });
		if (scenario === 'form') {
			return h(
				Fragment,
				null,
				h(
					Form,
					{
						onFormSubmit: (formValues: Record<string, unknown>) => {
							setSubmitted((previous) => previous + 1);
							setValues(JSON.stringify(formValues));
						}
					},
					h(
						Field.Root,
						partProps({ name: 'fruit', 'data-testid': 'field' }),
						h(Field.Label, partProps({ 'data-testid': 'label' }), 'Fruit'),
						select({ required: true }),
						h(Field.Error, partProps({ match: 'valueMissing', 'data-testid': 'error' }), 'Required')
					),
					h('button', { type: 'submit' }, 'Submit')
				),
				h('output', { 'data-testid': 'submitted' }, String(submitted)),
				h('output', { 'data-testid': 'values' }, values)
			);
		}
		if (scenario === 'reset') {
			return h(
				'form',
				null,
				select({ name: 'fruit', defaultValue: 'apple' }),
				h('button', { type: 'reset' }, 'Reset')
			);
		}
		if (scenario === 'disabled') return select({ defaultValue: 'apple', disabled: true });
		if (scenario === 'readonly') return select({ defaultValue: 'apple', readOnly: true });
		return h('div', { style: { paddingTop: 200 } }, select({ defaultValue: 'banana' }));
	}

	return mountApp(node, App);
}
