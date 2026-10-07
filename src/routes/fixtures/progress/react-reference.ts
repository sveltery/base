// React Base UI 1.8.0 counterpart of ProgressFixture.svelte. Comparison only; never imported by src/lib.
import { createElement as h, Fragment, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Progress } from '@base-ui/react/progress';
import { scenarioModel, type ProgressCase } from './cases.js';

// Base UI's published prop types omit `data-*` attributes the DOM still accepts.
function partProps(props: object) {
	return props as never;
}

export function mountProgressReference(
	node: HTMLElement,
	scenario: ProgressCase,
	onReady: () => void
) {
	const model = scenarioModel(scenario);

	function ariaText(formatted: string, raw: number | null) {
		return raw == null ? 'Waiting to start' : `${formatted} uploaded`;
	}

	function App() {
		const [value, setValue] = useState<number | null>(model.value);
		const [labelId, setLabelId] = useState('label-a');
		const [showLabel, setShowLabel] = useState(true);
		const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
		useEffect(onReady, []);

		const format =
			scenario === 'formatted'
				? { style: 'currency' as const, currency }
				: scenario === 'locale'
					? { style: 'decimal' as const, minimumFractionDigits: 2, maximumFractionDigits: 2 }
					: undefined;

		const buttons =
			scenario === 'cycle'
				? [
						h('button', { type: 'button', onClick: () => setValue(null) }, 'Indeterminate'),
						h('button', { type: 'button', onClick: () => setValue(50) }, 'Halfway'),
						h('button', { type: 'button', onClick: () => setValue(100) }, 'Complete')
					]
				: scenario === 'range'
					? [
							h('button', { type: 'button', onClick: () => setValue(50) }, 'Over'),
							h('button', { type: 'button', onClick: () => setValue(10) }, 'Under')
						]
					: scenario === 'formatted'
						? [
								h(
									'button',
									{
										type: 'button',
										onClick: () => setCurrency((current) => (current === 'USD' ? 'EUR' : 'USD'))
									},
									'Switch currency'
								)
							]
						: scenario === 'aria-text' || scenario === 'value-child'
							? [h('button', { type: 'button', onClick: () => setValue(null) }, 'Clear')]
							: scenario === 'label'
								? [
										h(
											'button',
											{ type: 'button', onClick: () => setLabelId('label-b') },
											'Change id'
										),
										h(
											'button',
											{ type: 'button', onClick: () => setShowLabel(false) },
											'Remove label'
										)
									]
								: [];

		const label = showLabel
			? h(
					Progress.Label,
					partProps({
						'data-testid': 'label',
						id: scenario === 'label' ? labelId : undefined
					}),
					'Upload progress'
				)
			: null;

		const valuePart =
			scenario === 'value-child'
				? h(
						Progress.Value,
						partProps({
							'data-testid': 'value',
							children: (formatted: string | null, raw: number | null) =>
								`${formatted}|${raw === null ? 'null' : String(raw)}`
						})
					)
				: h(Progress.Value, partProps({ 'data-testid': 'value' }));

		return h(
			Fragment,
			null,
			...buttons,
			h(
				Progress.Root,
				{
					id: 'tested-progress',
					value,
					min: model.min,
					max: model.max,
					format,
					locale: model.locale,
					getAriaValueText: scenario === 'aria-text' ? ariaText : undefined
				},
				label,
				valuePart,
				h(
					Progress.Track,
					partProps({ 'data-testid': 'track' }),
					h(Progress.Indicator, partProps({ 'data-testid': 'indicator' }))
				)
			)
		);
	}

	const root = createRoot(node);
	root.render(h(App));
	return () => root.unmount();
}
