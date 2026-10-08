// React Base UI 1.8.0 counterpart of DialogFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from '@base-ui/react/dialog';
import { noteOpen, type OpenCall } from '../open-change.js';
import type { DialogCase } from './cases.js';

export function mountDialogReference(node: HTMLElement, scenario: DialogCase, onReady: () => void) {
	function App() {
		const [calls, setCalls] = useState<OpenCall[]>([]);
		useEffect(onReady, []);
		const changed = (
			open: boolean,
			details: { reason: string; isCanceled: boolean; cancel: () => void }
		) => setCalls((previous) => previous.concat(noteOpen(scenario, open, details)));

		const outside = h('button', { type: 'button', 'data-testid': 'outside' }, 'Outside');
		const callsNode = h('output', { 'data-testid': 'calls' }, JSON.stringify(calls));

		if (scenario === 'nested') {
			return h(
				Fragment,
				null,
				outside,
				h(
					Dialog.Root,
					{ onOpenChange: changed },
					h(Dialog.Trigger, null, 'Open'),
					h(
						Dialog.Portal,
						null,
						h(
							Dialog.Popup,
							{ 'data-testid': 'popup' } as never,
							h(Dialog.Title, null, 'Title'),
							h(Dialog.Close, null, 'Close'),
							h(
								Dialog.Root,
								null,
								h(Dialog.Trigger, null, 'Nested'),
								h(
									Dialog.Portal,
									null,
									h(
										Dialog.Popup,
										{ 'data-testid': 'nested-popup' } as never,
										h(Dialog.Title, null, 'Nested title'),
										h(Dialog.Close, null, 'Nested close')
									)
								)
							)
						)
					)
				),
				callsNode
			);
		}

		return h(
			Fragment,
			null,
			outside,
			h(
				Dialog.Root,
				{ modal: scenario === 'outside' ? false : true, onOpenChange: changed },
				h(
					Dialog.Trigger,
					{
						disabled: scenario === 'disabled'
					},
					'Open'
				),
				h(
					Dialog.Portal,
					null,
					scenario === 'outside' ? null : h(Dialog.Backdrop, null),
					h(
						Dialog.Popup,
						{ 'data-testid': 'popup' } as never,
						h(Dialog.Title, null, 'Title'),
						h(Dialog.Description, null, 'Description'),
						h('button', { type: 'button' }, 'Inside'),
						h(Dialog.Close, null, 'Close')
					)
				)
			),
			callsNode
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
