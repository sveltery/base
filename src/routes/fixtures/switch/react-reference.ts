// React Base UI 1.8.0 counterpart of SwitchFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, type ReactNode } from 'react';
import { Switch } from '@base-ui/react/switch';
import { useCheckedFixture } from '../checked-reference.js';
import { mountApp } from '../react-fixture.js';
import type { SwitchCase } from './cases.js';

export function mountSwitchReference(node: HTMLElement, scenario: SwitchCase, onReady: () => void) {
	function App() {
		const box = useCheckedFixture(scenario, onReady);

		let control: ReactNode = h(
			Switch.Root,
			{ id: 'tested-switch', ...box.shared },
			h(Switch.Thumb),
			'Notifications'
		);

		if (scenario === 'form') {
			control = h(
				'form',
				{ onSubmit: box.submitted },
				h(
					Switch.Root,
					{
						id: 'tested-switch',
						name: 'notifications',
						value: 'yes',
						uncheckedValue: 'no',
						onCheckedChange: box.changed
					},
					h(Switch.Thumb),
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
					Switch.Root,
					{ id: 'tested-switch', onCheckedChange: box.changed },
					h(Switch.Thumb),
					'Notifications'
				)
			);
		} else if (scenario === 'native') {
			control = h(
				Switch.Root,
				{
					id: 'tested-switch',
					nativeButton: true,
					render: h('button'),
					onCheckedChange: box.changed
				},
				'Notifications'
			);
		} else if (box.bound) {
			control = h(
				Switch.Root,
				{ id: 'tested-switch', checked: box.owner, ...box.shared },
				h(Switch.Thumb),
				'Notifications'
			);
		} else if (scenario === 'disabled' || scenario === 'readonly') {
			control = h(
				Switch.Root,
				{
					id: 'tested-switch',
					disabled: scenario === 'disabled',
					readOnly: scenario === 'readonly',
					...box.shared
				},
				h(Switch.Thumb),
				'Notifications'
			);
		}

		return box.finish(control);
	}

	return mountApp(node, App);
}
