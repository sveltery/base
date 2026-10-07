// React Base UI 1.8.0 counterpart of DirectionProviderFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { DirectionProvider, useDirection } from '@base-ui/react/direction-provider';
import type { DirectionProviderCase } from './cases.js';

function Probe(props: { testId?: string }) {
	const direction = useDirection();
	return h('span', { 'data-testid': props.testId ?? 'direction' }, direction);
}

export function mountDirectionProviderReference(
	node: HTMLElement,
	scenario: DirectionProviderCase,
	onReady: () => void
) {
	function App() {
		const [direction, setDirection] = useState<'ltr' | 'rtl'>('rtl');
		useEffect(onReady, []);

		let body: ReactNode;
		if (scenario === 'outside') body = h(Probe, {});
		else if (scenario === 'omitted') body = h(DirectionProvider, null, h(Probe, {}));
		else if (scenario === 'rtl') body = h(DirectionProvider, { direction: 'rtl' }, h(Probe, {}));
		else if (scenario === 'reactive') {
			body = h(
				Fragment,
				null,
				h(
					'button',
					{
						type: 'button',
						onClick: () => setDirection(direction === 'rtl' ? 'ltr' : 'rtl')
					},
					'Flip direction'
				),
				h(DirectionProvider, { direction }, h(Probe, {}))
			);
		} else {
			body = h(
				DirectionProvider,
				{ direction: 'rtl' },
				h(Probe, { testId: 'outer' }),
				h(DirectionProvider, { direction: 'ltr' }, h(Probe, { testId: 'inner' }))
			);
		}

		return body;
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
