// React Base UI 1.8.0 counterpart of PopoverFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Popover } from '@base-ui/react/popover';
import type { PopoverCase } from './cases.js';

function partProps(props: object) {
	return props as never;
}

type Call = { open: boolean; reason: string; canceled: boolean };

export function mountPopoverReference(
	node: HTMLElement,
	scenario: PopoverCase,
	onReady: () => void
) {
	function App() {
		const [owner, setOwner] = useState(scenario === 'open');
		const [calls, setCalls] = useState<Call[]>([]);
		const [handle] = useState(() => Popover.createHandle());
		useEffect(onReady, []);
		const bound = scenario === 'bound' || scenario === 'open';

		function onOpen(
			nextOpen: boolean,
			details: { reason: string; isCanceled: boolean; cancel: () => void }
		) {
			if (scenario === 'cancel') details.cancel();
			setCalls((list) =>
				list.concat({
					open: nextOpen,
					reason: details.reason,
					canceled: details.isCanceled
				})
			);
			if (!bound || details.isCanceled) return;
			setOwner(nextOpen);
		}

		const popup = h(
			Popover.Portal,
			null,
			h(
				Popover.Positioner,
				null,
				h(
					Popover.Popup,
					null,
					h(Popover.Title, null, 'Title'),
					'Content',
					h('button', { type: 'button' }, 'Inside'),
					scenario === 'close' || scenario === 'modal' ? h(Popover.Close, null, 'Close') : null
				)
			)
		);

		const rootProps =
			scenario === 'open'
				? { defaultOpen: true, onOpenChange: onOpen }
				: {
						open: bound ? owner : undefined,
						modal: scenario === 'modal' ? true : undefined,
						onOpenChange: onOpen
					};

		const trigger = h(
			Popover.Trigger,
			partProps({
				id: scenario === 'detached' ? 'detached-trigger' : undefined,
				handle: scenario === 'detached' ? handle : undefined,
				disabled: scenario === 'disabled' ? true : undefined,
				openOnHover: scenario === 'hover' ? true : undefined,
				delay: scenario === 'hover' ? 0 : undefined,
				onClick: (event: { preventBaseUIHandler: () => void }) => {
					if (scenario === 'prevented') event.preventBaseUIHandler();
				}
			}),
			'Open'
		);

		return h(
			Fragment,
			null,
			h('button', { type: 'button' }, 'Outside'),
			h('pre', { 'data-testid': 'calls' }, JSON.stringify(calls)),
			scenario === 'tab'
				? h('button', { type: 'button', 'data-testid': 'before' }, 'Before')
				: null,
			scenario === 'detached'
				? h(Fragment, null, trigger, h(Popover.Root, { handle, onOpenChange: onOpen }, popup))
				: h(Popover.Root, rootProps, trigger, popup),
			scenario === 'tab' ? h('button', { type: 'button', 'data-testid': 'after' }, 'After') : null
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
