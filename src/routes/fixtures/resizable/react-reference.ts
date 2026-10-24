// React react-resizable-panels 4.5.8 counterpart of ResizableFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Group, Panel, Separator, usePanelRef, type Layout } from 'react-resizable-panels';
import type { ResizableCase } from './cases.js';

export function mountResizableReference(
	node: HTMLElement,
	scenario: ResizableCase,
	onReady: () => void
) {
	function App() {
		const panel = usePanelRef();
		const [settled, setSettled] = useState<Layout>({});
		useEffect(onReady, []);
		return h(
			Fragment,
			null,
			h(
				'div',
				{ style: { width: 600, height: 600 } },
				h(
					Group,
					{
						id: 'group',
						orientation: scenario === 'vertical' ? 'vertical' : 'horizontal',
						disabled: scenario === 'disabled',
						onLayoutChanged: setSettled
					},
					h(
						Panel,
						{
							panelRef: panel,
							id: 'first',
							defaultSize: '30%',
							minSize: '10%',
							collapsible: scenario === 'collapsible'
						},
						'First'
					),
					h(Separator, {
						id: 'separator',
						style: { width: 8, height: 8, background: 'gray' }
					}),
					h(Panel, { id: 'second', minSize: '20%' }, 'Second')
				)
			),
			h('output', { 'data-testid': 'layout' }, JSON.stringify(settled)),
			h('button', { type: 'button', onClick: () => panel.current?.collapse() }, 'Collapse'),
			h('button', { type: 'button', onClick: () => panel.current?.expand() }, 'Expand'),
			h('button', { type: 'button', onClick: () => panel.current?.resize('50%') }, 'Half')
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
