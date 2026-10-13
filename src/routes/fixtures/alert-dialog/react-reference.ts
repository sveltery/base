// React Base UI 1.8.0 counterpart of AlertDialogFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { Dialog } from '@base-ui/react/dialog';
import { mountApp, passProps } from '../react-fixture.js';
import { noteOpen, type OpenCall } from '../open-change.js';
import type { AlertDialogCase } from './cases.js';

type Details = { reason: string; isCanceled: boolean; cancel: () => void };

export function mountAlertDialogReference(
	node: HTMLElement,
	scenario: AlertDialogCase,
	onReady: () => void
) {
	const handle = AlertDialog.createHandle<number>();

	function App() {
		const [calls, setCalls] = useState<OpenCall[]>([]);
		useEffect(onReady, []);
		const changed = (open: boolean, details: Details) =>
			setCalls((previous) => previous.concat(noteOpen(scenario, open, details)));

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
							passProps({ 'data-testid': 'parent-popup' }),
							h(Dialog.Title, null, 'Settings'),
							h(
								AlertDialog.Root,
								null,
								h(AlertDialog.Trigger, null, 'Delete'),
								h(
									AlertDialog.Portal,
									null,
									h(
										AlertDialog.Popup,
										passProps({ 'data-testid': 'popup' }),
										h(AlertDialog.Title, null, 'Confirm'),
										h(AlertDialog.Close, null, 'Cancel')
									)
								)
							)
						)
					)
				),
				callsNode
			);
		}

		const detached = scenario === 'detached';
		const triggers: ReactNode = detached
			? [1, 2].map((number) =>
					h(
						AlertDialog.Trigger,
						passProps({
							key: number,
							handle,
							id: `trigger-${number}`,
							'data-testid': `trigger-${number}`,
							payload: number
						}),
						`Trigger ${number}`
					)
				)
			: h(AlertDialog.Trigger, passProps({ 'data-testid': 'trigger' }), 'Open');

		return h(
			Fragment,
			null,
			outside,
			detached ? triggers : null,
			h(
				AlertDialog.Root,
				passProps({
					handle: detached ? handle : undefined,
					defaultOpen: scenario === 'open',
					onOpenChange: changed,
					children: ({ payload }: { payload: unknown }) =>
						h(
							Fragment,
							null,
							detached ? null : triggers,
							h(
								'span',
								{ 'data-testid': 'root-payload' },
								payload === undefined ? 'No payload' : String(payload)
							),
							h(
								AlertDialog.Portal,
								null,
								scenario === 'backdrop'
									? h(AlertDialog.Backdrop, passProps({ 'data-testid': 'backdrop' }))
									: null,
								h(
									AlertDialog.Popup,
									passProps({ 'data-testid': 'popup' }),
									h(AlertDialog.Title, null, 'Title'),
									h(AlertDialog.Description, null, 'Description'),
									h('span', { 'data-testid': 'content' }, String(payload)),
									h('button', { type: 'button' }, 'Inside'),
									h(AlertDialog.Close, null, 'Close')
								)
							)
						)
				})
			),
			callsNode
		);
	}

	return mountApp(node, App);
}
