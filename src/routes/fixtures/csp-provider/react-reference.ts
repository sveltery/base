// React Base UI 1.8.0 counterpart of CSPProviderFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { CSPProvider } from '@base-ui/react/csp-provider';
import { useCSPContext } from '@base-ui/react/internals/csp-context';
import type { CSPProviderCase } from './cases.js';

function Probe(props: { id?: string }) {
	const csp = useCSPContext();
	const id = props.id ?? 'csp';
	return h(
		Fragment,
		null,
		h('span', { 'data-testid': `${id}-nonce` }, csp.nonce === undefined ? 'undefined' : csp.nonce),
		h('span', { 'data-testid': `${id}-styles` }, String(csp.disableStyleElements))
	);
}

export function mountCSPProviderReference(
	node: HTMLElement,
	scenario: CSPProviderCase,
	onReady: () => void
) {
	function App() {
		const [nonce, setNonce] = useState<string | undefined>('test-nonce');
		const [disableStyleElements, setDisableStyleElements] = useState<boolean | undefined>(false);
		useEffect(onReady, []);

		let body: ReactNode;
		if (scenario === 'outside') body = h(Probe, {});
		else if (scenario === 'omitted') body = h(CSPProvider, null, h(Probe, {}));
		else if (scenario === 'nonce') body = h(CSPProvider, { nonce: 'test-nonce' }, h(Probe, {}));
		else if (scenario === 'disabled')
			body = h(CSPProvider, { disableStyleElements: true }, h(Probe, {}));
		else if (scenario === 'reactive') {
			body = h(
				Fragment,
				null,
				h(
					'button',
					{
						type: 'button',
						onClick: () => {
							if (nonce === 'test-nonce') {
								setNonce('next-nonce');
								setDisableStyleElements(true);
								return;
							}
							setNonce('test-nonce');
							setDisableStyleElements(false);
						}
					},
					'Update CSP'
				),
				h(CSPProvider, { nonce, disableStyleElements }, h(Probe, {}))
			);
		} else {
			body = h(
				CSPProvider,
				{ nonce: 'outer-nonce', disableStyleElements: false },
				h(Probe, { id: 'outer' }),
				h(CSPProvider, { disableStyleElements: true }, h(Probe, { id: 'inner' }))
			);
		}

		return body;
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
