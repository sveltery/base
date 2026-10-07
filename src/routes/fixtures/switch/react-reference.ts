// React Base UI 1.8.0 counterpart of SwitchFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Switch } from '@base-ui/react/switch';
import type { SwitchCase } from './cases.js';

type Call = { checked: boolean; reason: string; canceled: boolean };

export function mountSwitchReference(node: HTMLElement, scenario: SwitchCase, onReady: () => void) {
	function App() {
		const [owner, setOwner] = useState(false);
		const [calls, setCalls] = useState<Call[]>([]);
		const [values, setValues] = useState<(string | null)[]>([]);
		useEffect(onReady, []);

		const bound = scenario === 'bound';

		function changed(
			next: boolean,
			details: { reason: string; isCanceled: boolean; cancel: () => void }
		) {
			if (scenario === 'cancel') details.cancel();
			const call = { checked: next, reason: details.reason, canceled: details.isCanceled };
			setCalls((previous) => [...previous, call]);
			if (bound && !details.isCanceled) setOwner(next);
		}

		function prevent(event: { preventBaseUIHandler?: () => void }) {
			if (scenario === 'prevented') event.preventBaseUIHandler?.();
		}

		function submitted(event: { preventDefault: () => void; currentTarget: EventTarget | null }) {
			event.preventDefault();
			const form = event.currentTarget;
			if (!(form instanceof HTMLFormElement)) return;
			const value = new FormData(form).get('notifications');
			setValues((previous) => [...previous, typeof value === 'string' ? value : null]);
		}

		const shared = {
			onCheckedChange: changed,
			onClick: prevent
		};

		let control: ReactNode = h(
			Switch.Root,
			{ id: 'tested-switch', ...shared },
			h(Switch.Thumb),
			'Notifications'
		);

		if (scenario === 'form') {
			control = h(
				'form',
				{ onSubmit: submitted },
				h(
					Switch.Root,
					{
						id: 'tested-switch',
						name: 'notifications',
						value: 'yes',
						uncheckedValue: 'no',
						onCheckedChange: changed
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
					{ id: 'tested-switch', onCheckedChange: changed },
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
					onCheckedChange: changed
				},
				'Notifications'
			);
		} else if (bound) {
			control = h(
				Switch.Root,
				{ id: 'tested-switch', checked: owner, ...shared },
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
					...shared
				},
				h(Switch.Thumb),
				'Notifications'
			);
		}

		return h(
			Fragment,
			null,
			bound
				? h('input', {
						type: 'checkbox',
						'aria-label': 'Owner checked',
						checked: owner,
						onChange: () => setOwner(!owner)
					})
				: null,
			control,
			h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)),
			h('output', { 'data-testid': 'values' }, JSON.stringify(values))
		);
	}

	const root: Root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
