// React Base UI 1.9.0 counterpart of ComboboxFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { Combobox } from '@base-ui/react/combobox';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { fruits, type ComboboxCase } from './cases.js';

import { mountApp, passProps } from '../react-fixture.js';

const partProps = passProps;

function list(scenario: ComboboxCase) {
	return h(
		Combobox.Portal,
		null,
		h(
			Combobox.Positioner,
			partProps({ 'data-testid': 'positioner' }),
			h(
				Combobox.Popup,
				partProps({ 'data-testid': 'popup' }),
				scenario === 'popup-input'
					? h(Combobox.Input, partProps({ 'data-testid': 'input' }))
					: null,
				h(Combobox.Empty, partProps({ 'data-testid': 'empty' }), 'No fruits found'),
				h(Combobox.List, null, (item: string) => h(Combobox.Item, { key: item, value: item }, item))
			)
		)
	);
}

function control(scenario: ComboboxCase) {
	return h(
		Fragment,
		null,
		h(
			Combobox.InputGroup,
			null,
			h(Combobox.Input, partProps({ 'data-testid': 'input' })),
			h(Combobox.Clear, partProps({ 'data-testid': 'clear', 'aria-label': 'Clear' })),
			h(Combobox.Trigger, partProps({ 'data-testid': 'trigger', 'aria-label': 'Open' }))
		),
		list(scenario)
	);
}

function combobox(scenario: ComboboxCase, props: object): ReactNode {
	return h(Combobox.Root, passProps({ items: fruits, ...props }), control(scenario));
}

export function mountComboboxReference(
	node: HTMLElement,
	scenario: ComboboxCase,
	onReady: () => void
) {
	function App() {
		const [submitted, setSubmitted] = useState(0);
		const [values, setValues] = useState('');
		useEffect(onReady, []);

		if (scenario === 'plain') return combobox(scenario, {});
		if (scenario === 'multiple') {
			return h(
				Combobox.Root,
				passProps({ items: fruits, multiple: true }),
				h(
					Combobox.Chips,
					partProps({ 'data-testid': 'chips' }),
					h(Combobox.Value, null, (selected: string[]) =>
						h(
							Fragment,
							null,
							selected.map((fruit) =>
								h(
									Combobox.Chip,
									partProps({ key: fruit, 'data-testid': `chip-${fruit}` }),
									fruit,
									h(Combobox.ChipRemove, { 'aria-label': `Remove ${fruit}` })
								)
							)
						)
					),
					h(Combobox.Input, partProps({ 'data-testid': 'input' }))
				),
				list(scenario)
			);
		}
		if (scenario === 'popup-input') {
			return h(
				Combobox.Root,
				passProps({ items: fruits }),
				h(
					Combobox.Trigger,
					partProps({ 'data-testid': 'trigger' }),
					h(Combobox.Value, { placeholder: 'Pick a fruit' })
				),
				list(scenario)
			);
		}
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
						combobox(scenario, { required: true }),
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
				combobox(scenario, { name: 'fruit', defaultValue: 'Apple' }),
				h('button', { type: 'reset' }, 'Reset')
			);
		}
		if (scenario === 'disabled')
			return combobox(scenario, { defaultValue: 'Apple', disabled: true });
		return combobox(scenario, { defaultValue: 'Apple', readOnly: true });
	}

	return mountApp(node, App);
}
