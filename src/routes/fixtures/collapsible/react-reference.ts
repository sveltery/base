// React Base UI 1.8.0 counterpart of CollapsibleFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Collapsible } from '@base-ui/react/collapsible';
import type { CollapsibleCase } from './cases.js';

// Base UI's published prop types omit `data-*` attributes the DOM still accepts.
function partProps(props: object) {
	return props as never;
}

type Call = { open: boolean; reason: string; canceled: boolean };

export function mountCollapsibleReference(
	node: HTMLElement,
	scenario: CollapsibleCase,
	onReady: () => void
) {
	function App() {
		const [owner, setOwner] = useState(scenario === 'open');
		const [calls, setCalls] = useState<Call[]>([]);
		useEffect(onReady, []);
		const bound = scenario === 'bound' || scenario === 'open';

		function changed(
			open: boolean,
			details: { reason: string; isCanceled: boolean; cancel: () => void }
		) {
			if (scenario === 'cancel') details.cancel();
			const call = { open, reason: details.reason, canceled: details.isCanceled };
			setCalls((previous) => [...previous, call]);
			if (bound && !details.isCanceled) setOwner(open);
		}

		const rootProps = {
			open: bound ? owner : undefined,
			defaultOpen: scenario === 'open' ? undefined : undefined,
			disabled: scenario === 'disabled',
			onOpenChange: changed
		};

		return h(
			Fragment,
			null,
			scenario === 'bound'
				? h('input', {
						type: 'checkbox',
						'aria-label': 'Owner open',
						checked: owner,
						onChange: () => setOwner(!owner)
					})
				: null,
			h(
				Collapsible.Root,
				scenario === 'open' ? { defaultOpen: true, onOpenChange: changed } : rootProps,
				h(
					Collapsible.Trigger,
					{
						id: 'tested-trigger',
						onClick: (event: { preventBaseUIHandler: () => void }) => {
							if (scenario === 'prevented') event.preventBaseUIHandler();
						}
					},
					'Details'
				),
				h(
					Collapsible.Panel,
					partProps({
						'data-testid': 'panel',
						keepMounted: scenario === 'mounted' || scenario === 'search' ? true : undefined,
						hiddenUntilFound: scenario === 'search' ? true : undefined,
						className: scenario === 'open' ? 'open-panel' : undefined
					}),
					'Panel content'
				)
			),
			h('output', { 'data-testid': 'calls' }, JSON.stringify(calls))
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
