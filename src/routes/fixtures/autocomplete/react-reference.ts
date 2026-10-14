// React Base UI 1.9.0 counterpart of AutocompleteFixture.svelte. Comparison only; never imported by src/lib.
// Base UI v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { Autocomplete } from '@base-ui/react/autocomplete';
import { Field } from '@base-ui/react/field';
import { Form } from '@base-ui/react/form';
import { tags, type AutocompleteCase } from './cases.js';

import { mountApp, passProps } from '../react-fixture.js';

function control() {
	return h(
		Fragment,
		null,
		h(
			Autocomplete.InputGroup,
			null,
			h(Autocomplete.Input, passProps({ 'data-testid': 'input' })),
			h(Autocomplete.Clear, passProps({ 'data-testid': 'clear', 'aria-label': 'Clear' })),
			h(Autocomplete.Trigger, passProps({ 'data-testid': 'trigger', 'aria-label': 'Open' }))
		),
		h(
			Autocomplete.Portal,
			null,
			h(
				Autocomplete.Positioner,
				passProps({ 'data-testid': 'positioner' }),
				h(
					Autocomplete.Popup,
					passProps({ 'data-testid': 'popup' }),
					h(Autocomplete.Empty, passProps({ 'data-testid': 'empty' }), 'No tags found'),
					h(
						Autocomplete.List,
						passProps({
							children: (tag: string) => h(Autocomplete.Item, { key: tag, value: tag }, tag)
						})
					)
				)
			)
		)
	);
}

function autocomplete(props: object): ReactNode {
	return h(Autocomplete.Root, passProps({ items: tags, ...props }), control());
}

export function mountAutocompleteReference(
	node: HTMLElement,
	scenario: AutocompleteCase,
	onReady: () => void
) {
	function App() {
		const [submitted, setSubmitted] = useState(0);
		const [values, setValues] = useState('');
		useEffect(onReady, []);

		if (scenario === 'plain') return autocomplete({});
		if (scenario === 'inline') return autocomplete({ mode: 'both' });
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
						passProps({ name: 'tag', 'data-testid': 'field' }),
						h(Field.Label, passProps({ 'data-testid': 'label' }), 'Tag'),
						autocomplete({ required: true }),
						h(Field.Error, passProps({ match: 'valueMissing', 'data-testid': 'error' }), 'Required')
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
				autocomplete({ name: 'tag', defaultValue: 'docs' }),
				h('button', { type: 'reset' }, 'Reset')
			);
		}
		if (scenario === 'disabled') return autocomplete({ defaultValue: 'docs', disabled: true });
		return autocomplete({ defaultValue: 'docs', readOnly: true });
	}

	return mountApp(node, App);
}
