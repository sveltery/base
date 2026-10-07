// React Base UI 1.8.0 counterpart of ToggleFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Toggle } from '@base-ui/react/toggle';
import type { ToggleCase } from './cases.js';

type Call = { pressed: boolean; reason: string; canceled: boolean };

export function mountToggleReference(node: HTMLElement, scenario: ToggleCase, onReady: () => void) {
	function App() {
		const [owner, setOwner] = useState(false);
		const [calls, setCalls] = useState<Call[]>([]);
		useEffect(onReady, []);
		// React has no bind:pressed; the idiomatic equivalent is controlled `pressed` plus the callback.
		const bound = scenario === 'bound';
		return h(
			Fragment,
			null,
			bound
				? h('input', {
						type: 'checkbox',
						'aria-label': 'Owner pressed',
						checked: owner,
						onChange: () => setOwner(!owner)
					})
				: null,
			h(
				Toggle,
				{
					id: 'tested-toggle',
					pressed: bound ? owner : undefined,
					disabled: scenario === 'disabled',
					onPressedChange: (pressed, details) => {
						if (scenario === 'cancel') details.cancel();
						const call = { pressed, reason: details.reason, canceled: details.isCanceled };
						setCalls((previous) => [...previous, call]);
						if (bound && !details.isCanceled) setOwner(pressed);
					},
					// Base UI ignores preventDefault here; its skip contract is preventBaseUIHandler.
					onClick: (event) => {
						if (scenario === 'prevented') event.preventBaseUIHandler();
					}
				},
				'Bold'
			),
			h('output', { 'data-testid': 'calls' }, JSON.stringify(calls))
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
