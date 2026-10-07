// React Base UI 1.8.0 counterpart of FieldsetFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Fieldset } from '@base-ui/react/fieldset';
import type { FieldsetCase } from './cases.js';

export function mountFieldsetReference(
	node: HTMLElement,
	scenario: FieldsetCase,
	onReady: () => void
) {
	function App() {
		const [outerDisabled, setOuterDisabled] = useState(false);
		const [innerDisabled, setInnerDisabled] = useState(true);
		const [legendId, setLegendId] = useState('legend-a');
		const [showLegend, setShowLegend] = useState(true);
		const [labels, setLabels] = useState<'old' | 'both' | 'new'>('old');
		useEffect(onReady, []);

		if (scenario === 'labelled') {
			return h(
				Fieldset.Root,
				{ 'data-testid': 'fieldset' },
				h(Fieldset.Legend, { 'data-testid': 'legend' }, 'Legend'),
				h('input', { 'aria-label': 'Name' })
			);
		}

		if (scenario === 'custom-id') {
			return h(
				Fieldset.Root,
				{ 'data-testid': 'fieldset' },
				h(Fieldset.Legend, { id: 'legend-id', 'data-testid': 'legend' }, 'Legend')
			);
		}

		if (scenario === 'disabled') {
			return h(
				Fieldset.Root,
				{ disabled: true, 'data-testid': 'fieldset' },
				h('input', { 'aria-label': 'Name' })
			);
		}

		if (scenario === 'nested') {
			return h(
				Fragment,
				null,
				h(
					Fieldset.Root,
					{ disabled: outerDisabled, 'data-testid': 'outer' },
					h(
						Fieldset.Root,
						{ disabled: innerDisabled, 'data-testid': 'inner' },
						h('input', { 'aria-label': 'Name' })
					)
				),
				h('button', { type: 'button', onClick: () => setOuterDisabled(true) }, 'Disable outer'),
				h('button', { type: 'button', onClick: () => setInnerDisabled(false) }, 'Enable inner'),
				h('button', { type: 'button', onClick: () => setOuterDisabled(false) }, 'Enable outer')
			);
		}

		if (scenario === 'dynamic') {
			return h(
				Fragment,
				null,
				h(
					Fieldset.Root,
					{ 'data-testid': 'fieldset' },
					showLegend
						? h(Fieldset.Legend, { id: legendId, 'data-testid': 'legend' }, 'Legend')
						: null
				),
				h('button', { type: 'button', onClick: () => setLegendId('legend-b') }, 'Change id'),
				h('button', { type: 'button', onClick: () => setShowLegend(false) }, 'Remove legend')
			);
		}

		if (scenario === 'labels') {
			return h(
				Fragment,
				null,
				h(
					Fieldset.Root,
					{ 'data-testid': 'fieldset' },
					labels !== 'new'
						? h(Fieldset.Legend, { key: 'old', id: 'old-label', 'data-testid': 'old' }, 'Old')
						: null,
					labels !== 'old'
						? h(Fieldset.Legend, { key: 'new', id: 'new-label', 'data-testid': 'new' }, 'New')
						: null
				),
				h('button', { type: 'button', onClick: () => setLabels('both') }, 'Show both'),
				h('button', { type: 'button', onClick: () => setLabels('new') }, 'Show new')
			);
		}

		return h(
			Fieldset.Root,
			{ 'data-testid': 'outer' },
			h(Fieldset.Legend, { id: 'outer-legend' }, 'Outer'),
			h(
				Fieldset.Root,
				{ 'data-testid': 'inner' },
				h(Fieldset.Legend, { id: 'inner-legend' }, 'Inner')
			)
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
