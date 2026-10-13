// React Base UI 1.9.0 counterpart of ContextMenuFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ContextMenu } from '@base-ui/react/context-menu';
import type { ContextMenuCase } from './cases.js';

const items = ['Copy', 'Paste', 'Rename'];

export function mountContextMenuReference(
	node: HTMLElement,
	scenario: ContextMenuCase,
	onReady: () => void
) {
	function App() {
		const [calls, setCalls] = useState<{ open: boolean; reason: string }[]>([]);
		const [clicks, setClicks] = useState<string[]>([]);
		useEffect(onReady, []);

		return h(
			Fragment,
			null,
			h('button', { type: 'button' }, 'Outside'),
			h('pre', { 'data-testid': 'calls' }, JSON.stringify(calls)),
			h('pre', { 'data-testid': 'clicks' }, JSON.stringify(clicks)),
			h(
				ContextMenu.Root,
				{
					disabled: scenario === 'disabled',
					onOpenChange: (open: boolean, details: { reason: string }) =>
						setCalls((list) => list.concat({ open, reason: details.reason }))
				},
				h(
					ContextMenu.Trigger,
					{
						'data-testid': 'area',
						style: {
							width: 300,
							height: 200,
							border: '1px dashed',
							display: 'grid',
							placeItems: 'center'
						}
					} as never,
					'Right click here'
				),
				h(
					ContextMenu.Portal,
					null,
					h(
						ContextMenu.Positioner,
						{ 'data-testid': 'positioner' } as never,
						h(
							ContextMenu.Popup,
							{ 'aria-label': 'Actions' },
							items.map((item) =>
								h(
									ContextMenu.Item,
									{ key: item, onClick: () => setClicks((list) => list.concat(item)) },
									item
								)
							),
							h(ContextMenu.Separator, null),
							h(ContextMenu.Item, { disabled: true }, 'Delete')
						)
					)
				)
			)
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
