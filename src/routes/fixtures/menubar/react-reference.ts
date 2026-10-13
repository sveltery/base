// React Base UI 1.9.0 counterpart of MenubarFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Menu } from '@base-ui/react/menu';
import { Menubar } from '@base-ui/react/menubar';
import type { MenubarCase } from './cases.js';

type Call = { menu: string; open: boolean; reason: string };

const menus = [
	{ label: 'File', items: ['New', 'Open'] },
	{ label: 'Edit', items: ['Copy', 'Paste'] },
	{ label: 'View', items: ['Zoom In', 'Zoom Out'] }
];

export function mountMenubarReference(
	node: HTMLElement,
	scenario: MenubarCase,
	onReady: () => void
) {
	function App() {
		const [calls, setCalls] = useState<Call[]>([]);
		const [clicks, setClicks] = useState<string[]>([]);
		useEffect(onReady, []);

		return h(
			Fragment,
			null,
			h('button', { type: 'button' }, 'Outside'),
			h('pre', { 'data-testid': 'calls' }, JSON.stringify(calls)),
			h('pre', { 'data-testid': 'clicks' }, JSON.stringify(clicks)),
			h(
				Menubar,
				{
					orientation: scenario === 'vertical' ? 'vertical' : 'horizontal',
					loopFocus: scenario !== 'no-loop',
					disabled: scenario === 'disabled',
					style: { display: 'flex', gap: 4 }
				},
				menus.map((menu) =>
					h(
						Menu.Root,
						{
							key: menu.label,
							onOpenChange: (open: boolean, details: { reason: string }) =>
								setCalls((list) => list.concat({ menu: menu.label, open, reason: details.reason }))
						},
						h(
							Menu.Trigger,
							{ disabled: scenario === 'disabled-trigger' && menu.label === 'Edit' },
							menu.label
						),
						h(
							Menu.Portal,
							null,
							h(
								Menu.Positioner,
								null,
								h(
									Menu.Popup,
									{ 'aria-label': `${menu.label} menu` },
									menu.items.map((item) =>
										h(
											Menu.Item,
											{ key: item, onClick: () => setClicks((list) => list.concat(item)) },
											item
										)
									)
								)
							)
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
