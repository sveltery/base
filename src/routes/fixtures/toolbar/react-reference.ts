// React Base UI 1.8.0 counterpart of ToolbarFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { Toolbar } from '@base-ui/react/toolbar';
import type { ToolbarCase } from './cases.js';

export function mountToolbarReference(
	node: HTMLElement,
	scenario: ToolbarCase,
	onReady: () => void
) {
	function App() {
		const [clicks, setClicks] = useState(0);
		useEffect(onReady, []);

		const count = () => setClicks((previous) => previous + 1);
		const orientation = scenario === 'vertical' ? 'vertical' : 'horizontal';
		const showClicks = scenario === 'activate' || scenario === 'custom';

		let toolbar;
		if (scenario === 'keyboard' || scenario === 'vertical' || scenario === 'rtl') {
			toolbar = h(
				Toolbar.Root,
				{ 'aria-label': 'Tools', orientation },
				h(Toolbar.Button, null, 'One'),
				h(Toolbar.Link, { href: 'https://base-ui.com' }, 'Link'),
				h(Toolbar.Group, null, h(Toolbar.Button, null, 'Two'), h(Toolbar.Button, null, 'Three'))
			);
		} else if (scenario === 'loop') {
			toolbar = h(
				Toolbar.Root,
				{ 'aria-label': 'Tools', loopFocus: false },
				h(Toolbar.Button, null, 'One'),
				h(Toolbar.Button, null, 'Two')
			);
		} else if (scenario === 'disabled') {
			toolbar = h(
				Toolbar.Root,
				{ 'aria-label': 'Tools', disabled: true },
				h(Toolbar.Button, null, 'One'),
				h(Toolbar.Link, { href: 'https://base-ui.com' }, 'Link'),
				h(
					Toolbar.Group,
					null,
					h(Toolbar.Button, null, 'Two'),
					h(Toolbar.Link, { href: 'https://base-ui.com' }, 'Docs')
				)
			);
		} else if (scenario === 'focusable') {
			toolbar = h(
				Toolbar.Root,
				{ 'aria-label': 'Tools' },
				h(Toolbar.Button, { disabled: true }, 'One'),
				h(Toolbar.Button, { disabled: true }, 'Two'),
				h(Toolbar.Button, { disabled: true }, 'Three')
			);
		} else if (scenario === 'skip') {
			toolbar = h(
				Toolbar.Root,
				{ 'aria-label': 'Tools' },
				h(Toolbar.Button, null, 'One'),
				h(Toolbar.Button, { disabled: true, focusableWhenDisabled: false }, 'Two'),
				h(Toolbar.Button, null, 'Three')
			);
		} else if (scenario === 'activate') {
			toolbar = h(
				Toolbar.Root,
				{ 'aria-label': 'Tools' },
				h(Toolbar.Button, { onClick: count }, 'One'),
				h(Toolbar.Button, { disabled: true, onClick: count }, 'Two')
			);
		} else {
			toolbar = h(
				Toolbar.Root,
				{ 'aria-label': 'Tools' },
				h(Toolbar.Button, { nativeButton: false, render: h('span'), onClick: count }, 'Save')
			);
		}

		const body = scenario === 'rtl' ? h(DirectionProvider, { direction: 'rtl' }, toolbar) : toolbar;

		return h(
			Fragment,
			null,
			h('div', { dir: scenario === 'rtl' ? 'rtl' : 'ltr' }, body),
			showClicks ? h('output', { 'data-testid': 'clicks' }, String(clicks)) : null
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
