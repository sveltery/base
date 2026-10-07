// React Base UI 1.8.0 counterpart of CheckboxFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Checkbox } from '@base-ui/react/checkbox';
import type { CheckboxCase } from './cases.js';

// Base UI's published prop types omit `data-*` attributes the DOM still accepts.
function partProps(props: object) {
	return props as never;
}

type Call = { checked: boolean; reason: string; canceled: boolean };

export function mountCheckboxReference(
	node: HTMLElement,
	scenario: CheckboxCase,
	onReady: () => void
) {
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
			Checkbox.Root,
			{ id: 'tested-checkbox', ...shared },
			h(Checkbox.Indicator),
			'Notifications'
		);

		if (scenario === 'form' || scenario === 'enter') {
			control = h(
				'form',
				{ onSubmit: submitted },
				h(
					Checkbox.Root,
					{
						id: 'tested-checkbox',
						name: 'notifications',
						value: 'yes',
						uncheckedValue: 'no',
						onCheckedChange: changed
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
					{ id: 'tested-checkbox', onCheckedChange: changed },
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
					onCheckedChange: changed,
					'aria-label': 'Notifications'
				},
				'Notifications'
			);
		} else if (scenario === 'indeterminate') {
			control = h(
				Checkbox.Root,
				{ id: 'tested-checkbox', indeterminate: true, onCheckedChange: changed },
				h(Checkbox.Indicator, partProps({ 'data-testid': 'indicator' })),
				'Notifications'
			);
		} else if (bound) {
			control = h(
				Checkbox.Root,
				{ id: 'tested-checkbox', checked: owner, ...shared },
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
					...shared
				},
				h(Checkbox.Indicator),
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
