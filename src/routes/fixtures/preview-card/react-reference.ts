// React Base UI 1.8.0 counterpart of PreviewCardFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PreviewCard } from '@base-ui/react/preview-card';
import type { PreviewCardCase } from './cases.js';

type Call = { open: boolean; reason: string; canceled: boolean };

export function mountPreviewCardReference(
	node: HTMLElement,
	scenario: PreviewCardCase,
	onReady: () => void
) {
	const delay = scenario === 'standalone' ? 200 : 0;
	const closeDelay =
		scenario === 'standalone'
			? 200
			: scenario === 'close-delay'
				? 500
				: scenario === 'safe'
					? 300
					: 0;

	function App() {
		const [owner, setOwner] = useState(false);
		const [calls, setCalls] = useState<Call[]>([]);
		const [handle] = useState(() => PreviewCard.createHandle<string>());
		useEffect(onReady, []);
		const bound = scenario === 'bound';

		function onOpen(
			nextOpen: boolean,
			details: { reason: string; isCanceled: boolean; cancel: () => void }
		) {
			if (scenario === 'cancel') details.cancel();
			setCalls((list) =>
				list.concat({ open: nextOpen, reason: details.reason, canceled: details.isCanceled })
			);
			if (bound && !details.isCanceled) setOwner(nextOpen);
		}

		function popup(payload: string | undefined) {
			return h(
				PreviewCard.Portal,
				null,
				h(
					PreviewCard.Positioner,
					{ sideOffset: 8 },
					h(PreviewCard.Popup, { 'data-testid': 'popup' }, `Content ${payload ?? ''}`)
				)
			);
		}

		function trigger(
			props: { id: string; payload?: string; handle?: typeof handle },
			text: string
		) {
			return h(PreviewCard.Trigger, { href: '#', delay, closeDelay, ...props }, text);
		}

		let body;
		if (scenario === 'detached') {
			body = h(
				Fragment,
				null,
				trigger({ id: 'trigger', handle }, 'Link'),
				h(PreviewCard.Root, { handle, onOpenChange: onOpen }, ({ payload }) =>
					popup(payload as string | undefined)
				)
			);
		} else if (scenario === 'payload') {
			body = h(PreviewCard.Root, { onOpenChange: onOpen }, ({ payload }) =>
				h(
					Fragment,
					null,
					trigger({ id: 'first', payload: 'one' }, 'First'),
					trigger({ id: 'second', payload: 'two' }, 'Second'),
					popup(payload as string | undefined)
				)
			);
		} else {
			body = h(
				PreviewCard.Root,
				bound ? { open: owner, onOpenChange: onOpen } : { onOpenChange: onOpen },
				({ payload }) =>
					h(
						Fragment,
						null,
						trigger({ id: 'trigger' }, 'Link'),
						popup(payload as string | undefined)
					)
			);
		}

		return h(
			Fragment,
			null,
			h('button', { type: 'button' }, 'Outside'),
			h('button', { type: 'button', 'data-testid': 'show', onClick: () => setOwner(true) }, 'Show'),
			h('pre', { 'data-testid': 'calls' }, JSON.stringify(calls)),
			h('pre', { 'data-testid': 'owner' }, String(owner)),
			h('div', { style: { margin: '120px 0 0 40px' } }, body)
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
