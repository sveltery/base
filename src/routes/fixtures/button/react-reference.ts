// React Base UI 1.8.0 counterpart of ButtonFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@base-ui/react/button';
import type { ButtonCase } from './cases.js';

type ClickLog = { detail: number; shiftKey: boolean };

export function mountButtonReference(node: HTMLElement, scenario: ButtonCase, onReady: () => void) {
	function App() {
		const [clicks, setClicks] = useState<ClickLog[]>([]);
		const [moves, setMoves] = useState(0);
		useEffect(onReady, []);

		const label = scenario === 'link' ? 'Go' : 'Save';
		const custom =
			scenario === 'custom' || scenario === 'custom-disabled' || scenario === 'prevented';
		const record = (event: { detail: number; shiftKey: boolean }) => {
			setClicks((previous) => [...previous, { detail: event.detail, shiftKey: event.shiftKey }]);
		};
		const preventKey = (event: { preventDefault: () => void }) => {
			if (scenario === 'prevented') event.preventDefault();
		};

		let button;
		if (scenario === 'link') {
			button = h(
				Button,
				{
					id: 'tested-button',
					nativeButton: false,
					render: h('a', { href: '#target' }),
					onClick: record
				},
				label
			);
		} else if (custom) {
			button = h(
				Button,
				{
					id: 'tested-button',
					nativeButton: false,
					disabled: scenario === 'custom-disabled',
					render: h('span'),
					onClick: record,
					onKeyDown: preventKey,
					onKeyUp: preventKey
				},
				label
			);
		} else {
			button = h(
				Button,
				{
					id: 'tested-button',
					disabled: scenario === 'disabled' || scenario === 'focusable',
					focusableWhenDisabled: scenario === 'focusable',
					onClick: record,
					onMouseMove: () => setMoves((previous) => previous + 1)
				},
				label
			);
		}

		return h(
			Fragment,
			null,
			button,
			scenario === 'link' ? h('div', { style: { height: '200vh' } }) : null,
			h('output', { 'data-testid': 'clicks' }, JSON.stringify(clicks)),
			h('output', { 'data-testid': 'moves' }, String(moves))
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
