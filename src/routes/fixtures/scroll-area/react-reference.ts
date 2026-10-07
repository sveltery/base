// React Base UI 1.8.0 counterpart of ScrollAreaFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { ScrollArea } from '@base-ui/react/scroll-area';
import type { ScrollAreaCase } from './cases.js';

function partProps(props: object) {
	return props as never;
}

export function mountScrollAreaReference(
	node: HTMLElement,
	scenario: ScrollAreaCase,
	onReady: () => void
) {
	function App() {
		useEffect(onReady, []);
		const overflowing = scenario !== 'none';
		const rtl = scenario === 'rtl';
		const area = h(
			ScrollArea.Root,
			partProps({
				'data-testid': 'root',
				style: { width: 200, height: 200, ...(rtl ? { direction: 'rtl' as const } : {}) }
			}),
			h(
				ScrollArea.Viewport,
				partProps({ 'data-testid': 'viewport', style: { width: '100%', height: '100%' } }),
				h('div', {
					style: overflowing ? { width: 1000, height: 1000 } : { width: 40, height: 40 }
				})
			),
			h(
				ScrollArea.Scrollbar,
				partProps({ orientation: 'vertical', 'data-testid': 'scrollbar-y' }),
				h(ScrollArea.Thumb, null)
			),
			h(
				ScrollArea.Scrollbar,
				partProps({ orientation: 'horizontal', 'data-testid': 'scrollbar-x' }),
				h(ScrollArea.Thumb, null)
			),
			h(ScrollArea.Corner, partProps({ 'data-testid': 'corner' }))
		);

		if (!rtl) return area;
		return h(DirectionProvider, { direction: 'rtl' }, area);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
