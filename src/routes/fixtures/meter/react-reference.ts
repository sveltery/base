// React Base UI 1.8.0 counterpart of MeterFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Meter } from '@base-ui/react/meter';
import { ariaValueText, currencyFormat, type MeterCase } from './cases.js';

export function mountMeterReference(node: HTMLElement, scenario: MeterCase, onReady: () => void) {
	function App() {
		const [live, setLive] = useState(40);
		const [labelId, setLabelId] = useState('label-a');
		const [showLabel, setShowLabel] = useState(true);
		useEffect(onReady, []);

		const value =
			scenario === 'live'
				? live
				: scenario === 'clamp'
					? 150
					: scenario === 'range'
						? 30
						: scenario === 'label'
							? 50
							: scenario === 'basic'
								? 40
								: 30;
		const min = scenario === 'range' ? 20 : 0;
		const max = scenario === 'range' ? 40 : 100;
		const locale = scenario === 'locale' ? 'de-DE' : 'en-US';
		const format = scenario === 'currency' ? currencyFormat : undefined;
		const label =
			scenario === 'label'
				? 'Battery level'
				: scenario === 'locale'
					? 'Speicher'
					: scenario === 'range'
						? 'Level'
						: scenario === 'currency'
							? 'Cost'
							: 'Storage';
		const showMeterLabel = scenario !== 'label' || showLabel;

		return h(
			Fragment,
			null,
			scenario === 'live'
				? h('button', { type: 'button', onClick: () => setLive(77) }, 'Set 77')
				: null,
			scenario === 'label'
				? h(
						Fragment,
						null,
						h('button', { type: 'button', onClick: () => setLabelId('label-b') }, 'Change id'),
						h('button', { type: 'button', onClick: () => setShowLabel(false) }, 'Remove label')
					)
				: null,
			h(
				Meter.Root,
				{
					id: 'tested-meter',
					value,
					min,
					max,
					locale,
					format,
					getAriaValueText: scenario === 'aria' ? ariaValueText : undefined
				},
				showMeterLabel
					? h(Meter.Label, { id: scenario === 'label' ? labelId : undefined }, label)
					: null,
				h(Meter.Value, { id: 'meter-value' }),
				h(Meter.Track, null, h(Meter.Indicator, { id: 'meter-indicator' }))
			)
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
