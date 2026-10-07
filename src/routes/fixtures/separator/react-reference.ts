// React Base UI 1.8.0 counterpart of SeparatorFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Separator } from '@base-ui/react/separator';
import type { SeparatorCase } from './cases.js';

type Orientation = 'horizontal' | 'vertical';

export function mountSeparatorReference(
	node: HTMLElement,
	scenario: SeparatorCase,
	onReady: () => void
) {
	function App() {
		const [orientation, setOrientation] = useState<Orientation>(
			scenario === 'vertical' ? 'vertical' : 'horizontal'
		);
		useEffect(onReady, []);
		// Svelte uses a style string; React's idiom is a style object. Both give the divider a box.
		const style = orientation === 'vertical' ? { width: 1, height: 16 } : { height: 1 };
		return h(
			Fragment,
			null,
			scenario === 'reactive'
				? h(
						'button',
						{
							type: 'button',
							onClick: () =>
								setOrientation(orientation === 'horizontal' ? 'vertical' : 'horizontal')
						},
						'Flip orientation'
					)
				: null,
			h(Separator, { id: 'tested-separator', orientation, style })
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
