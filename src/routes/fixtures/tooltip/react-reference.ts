// React Base UI 1.8.0 counterpart of TooltipFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Tooltip } from '@base-ui/react/tooltip';
import type { TooltipCase } from './cases.js';

function partProps(props: object) {
	return props as never;
}

type Call = { open: boolean; reason: string; canceled: boolean };

export function mountTooltipReference(
	node: HTMLElement,
	scenario: TooltipCase,
	onReady: () => void
) {
	function App() {
		const [open, setOpen] = useState(false);
		const [calls, setCalls] = useState<Call[]>([]);
		const [handle] = useState(() => Tooltip.createHandle());
		useEffect(onReady, []);

		function changed(
			next: boolean,
			details: { reason: string; isCanceled: boolean; cancel: () => void }
		) {
			if (scenario === 'cancel') details.cancel();
			setCalls((list) =>
				list.concat({ open: next, reason: details.reason, canceled: details.isCanceled })
			);
			if (scenario === 'bound' && !details.isCanceled) setOpen(next);
		}

		const popup = (name: string) =>
			h(
				Tooltip.Portal,
				null,
				h(
					Tooltip.Positioner,
					partProps({ sideOffset: 8, 'data-testid': `${name}-positioner` }),
					h(
						Tooltip.Popup,
						partProps({
							'data-testid': `${name}-popup`,
							style: { padding: 8, background: 'canvas' }
						}),
						`${name} tooltip`
					)
				)
			);

		let content;
		if (scenario === 'provider') {
			content = h(
				Tooltip.Provider,
				null,
				['First', 'Second'].map((name) =>
					h(
						Tooltip.Root,
						{ key: name, onOpenChange: changed },
						h(Tooltip.Trigger, null, name),
						popup(name)
					)
				)
			);
		} else if (scenario === 'detached') {
			content = h(
				Fragment,
				null,
				h(Tooltip.Trigger, partProps({ handle, delay: 0 }), 'Info'),
				h(Tooltip.Root, { handle, onOpenChange: changed }, popup('Info'))
			);
		} else if (scenario === 'bound') {
			content = h(
				Fragment,
				null,
				h(
					'button',
					{ type: 'button', onClick: () => setOpen((value) => !value) },
					'Toggle externally'
				),
				h(
					Tooltip.Root,
					{ open, onOpenChange: changed },
					h(Tooltip.Trigger, partProps({ delay: 0 }), 'Info'),
					popup('Info')
				),
				h('output', { 'data-testid': 'bound' }, String(open))
			);
		} else if (scenario === 'cursor') {
			content = h(
				Tooltip.Root,
				{ trackCursorAxis: 'x', onOpenChange: changed },
				h(Tooltip.Trigger, partProps({ delay: 0, style: { width: 400, height: 40 } }), 'Info'),
				popup('Info')
			);
		} else {
			content = h(
				Tooltip.Root,
				{
					disabled: scenario === 'disabled',
					disableHoverablePopup: scenario === 'unhoverable',
					onOpenChange: changed
				},
				h(
					Tooltip.Trigger,
					partProps({
						delay: scenario === 'delay' ? undefined : 0,
						closeOnClick: scenario !== 'no-close-on-click'
					}),
					'Info'
				),
				popup('Info')
			);
		}

		return h(
			Fragment,
			null,
			h('button', { type: 'button' }, 'Outside'),
			h('pre', { 'data-testid': 'calls' }, JSON.stringify(calls)),
			h('div', { style: { padding: '120px 40px' } }, content)
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
