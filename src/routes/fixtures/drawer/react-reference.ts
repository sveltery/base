// React Base UI 1.8.0 counterpart of DrawerFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { Drawer } from '@base-ui/react/drawer';
import { mountApp, passProps } from '../react-fixture.js';
import { noteOpen, type OpenCall } from '../open-change.js';
import type { DrawerCase } from './cases.js';

type SnapPoint = number | string | null;

export function mountDrawerReference(node: HTMLElement, scenario: DrawerCase, onReady: () => void) {
	function App() {
		const [calls, setCalls] = useState<OpenCall[]>([]);
		const [snapPoint, setSnapPoint] = useState<SnapPoint>('160px');
		useEffect(onReady, []);

		const nested =
			scenario === 'nested'
				? h(
						Drawer.Root,
						null,
						h(Drawer.Trigger, null, 'Open nested'),
						h(
							Drawer.Portal,
							null,
							h(
								Drawer.Viewport,
								passProps({ 'data-testid': 'nested-viewport' }),
								h(
									Drawer.Popup,
									passProps({ 'data-testid': 'nested-popup' }),
									h(Drawer.Title, null, 'Nested'),
									h(Drawer.Close, null, 'Close nested')
								)
							)
						)
					)
				: null;

		const drawer = h(
			Drawer.Root,
			passProps({
				onOpenChange: (open: boolean, details: Parameters<typeof noteOpen>[2]) =>
					setCalls((previous) => previous.concat(noteOpen(scenario, open, details))),
				...(scenario === 'snap'
					? { snapPoints: ['160px', 1], snapPoint, onSnapPointChange: setSnapPoint }
					: {})
			}),
			h(Drawer.Trigger, null, 'Open'),
			scenario === 'swipe-area'
				? h(Drawer.SwipeArea, passProps({ 'data-testid': 'swipe-area' }))
				: null,
			h(
				Drawer.Portal,
				null,
				h(Drawer.Backdrop, passProps({ 'data-testid': 'backdrop' })),
				h(
					Drawer.Viewport,
					passProps({ 'data-testid': 'viewport' }),
					h(
						Drawer.Popup,
						passProps({ 'data-testid': 'popup' }),
						h(Drawer.Title, null, 'Title'),
						h(Drawer.Description, null, 'Description'),
						h('button', { type: 'button' }, 'Inside'),
						h(Drawer.Close, null, 'Close'),
						nested
					)
				)
			)
		);

		return h(
			Fragment,
			null,
			h('button', { type: 'button', 'data-testid': 'outside' }, 'Outside'),
			scenario === 'provider'
				? h(
						Drawer.Provider,
						null,
						h(Drawer.IndentBackground, passProps({ 'data-testid': 'indent-background' })),
						h(Drawer.Indent, passProps({ 'data-testid': 'indent' }), drawer)
					)
				: drawer,
			h('output', { 'data-testid': 'snap-point' }, JSON.stringify(snapPoint)),
			h('output', { 'data-testid': 'calls' }, JSON.stringify(calls))
		);
	}

	return mountApp(node, App);
}
