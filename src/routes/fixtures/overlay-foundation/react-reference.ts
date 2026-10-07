// React Base UI 1.8.0 counterpart for the overlay foundation harness.
// Comparison only; never imported by src/lib.
import { createElement as h, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
import type { OverlayFoundationCase } from './cases.js';

type Call = { open: boolean; reason: string; canceled: boolean };

function partProps(props: object) {
	return props as never;
}

export function mountOverlayFoundationReference(
	node: HTMLElement,
	scenario: OverlayFoundationCase,
	onReady: () => void
) {
	function App() {
		const [calls, setCalls] = useState<Call[]>([]);
		useEffect(onReady, []);

		function changed(
			open: boolean,
			details: { reason: string; isCanceled: boolean; cancel: () => void }
		) {
			if (scenario === 'cancel') details.cancel();
			setCalls((previous) => [
				...previous,
				{ open, reason: details.reason, canceled: details.isCanceled }
			]);
		}

		return h(
			'div',
			{ 'data-testid': 'anchor' },
			h(
				Dialog.Root,
				{ modal: scenario !== 'modeless', onOpenChange: changed },
				h(Dialog.Trigger, null, 'Open'),
				h('div', { 'data-testid': 'outside' }, 'Outside'),
				h('pre', { 'data-testid': 'calls' }, JSON.stringify(calls)),
				h(
					Dialog.Portal,
					null,
					h(
						Dialog.Popup,
						partProps({ 'data-testid': 'popup' }),
						h(Dialog.Title, null, 'Notice'),
						h('button', { type: 'button' }, 'Inside')
					)
				)
			)
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
