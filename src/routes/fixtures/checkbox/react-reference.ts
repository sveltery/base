// React Base UI 1.8.0 counterpart of CheckboxFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, type ReactNode } from 'react';
import { Checkbox } from '@base-ui/react/checkbox';
import { useCheckedFixture } from '../checked-reference.js';
import { mountApp, passProps } from '../react-fixture.js';
import type { CheckboxCase } from './cases.js';

const partProps = passProps;

export function mountCheckboxReference(
	node: HTMLElement,
	scenario: CheckboxCase,
	onReady: () => void
) {
	function App() {
		const box = useCheckedFixture(scenario, onReady);

		let control: ReactNode = h(
			Checkbox.Root,
			{ id: 'tested-checkbox', ...box.shared },
			h(Checkbox.Indicator),
			'Notifications'
		);

		if (scenario === 'form' || scenario === 'enter') {
			control = h(
				'form',
				{ onSubmit: box.submitted },
				h(
					Checkbox.Root,
					{
						id: 'tested-checkbox',
						name: 'notifications',
						value: 'yes',
						uncheckedValue: 'no',
						onCheckedChange: box.changed
					},
					h(Checkbox.Indicator),
					'Notifications'
				),
				h('button', { type: 'submit' }, 'Submit')
			);
		} else if (scenario === 'label') {
			control = h(
				'label',
				{ 'data-testid': 'label' },
				h('span', null, 'Toggle'),
				h(
					Checkbox.Root,
					{ id: 'tested-checkbox', onCheckedChange: box.changed },
					h(Checkbox.Indicator),
					'Notifications'
				)
			);
		} else if (scenario === 'native') {
			control = h(
				Checkbox.Root,
				{
					id: 'tested-checkbox',
					nativeButton: true,
					render: h('button'),
					onCheckedChange: box.changed,
					'aria-label': 'Notifications'
				},
				'Notifications'
			);
		} else if (scenario === 'indeterminate') {
			control = h(
				Checkbox.Root,
				{ id: 'tested-checkbox', indeterminate: true, onCheckedChange: box.changed },
				h(Checkbox.Indicator, partProps({ 'data-testid': 'indicator' })),
				'Notifications'
			);
		} else if (box.bound) {
			control = h(
				Checkbox.Root,
				{ id: 'tested-checkbox', checked: box.owner, ...box.shared },
				h(Checkbox.Indicator),
				'Notifications'
			);
		} else if (scenario === 'disabled' || scenario === 'readonly') {
			control = h(
				Checkbox.Root,
				{
					id: 'tested-checkbox',
					disabled: scenario === 'disabled',
					readOnly: scenario === 'readonly',
					...box.shared
				},
				h(Checkbox.Indicator),
				'Notifications'
			);
		}

		return box.finish(control);
	}

	return mountApp(node, App);
}
