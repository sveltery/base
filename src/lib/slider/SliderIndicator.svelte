<!--
	Visualizes the current value of the slider.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/slider/indicator/SliderIndicator.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { valueToPercent } from '../internal/valueToPercent.js';
	import PartHost from '../internal/PartHost.svelte';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { sliderStateAttributes } from './attributes.js';
	import { useSliderContext } from './context.svelte.js';
	import { getIndicatorStyles } from './indicator-style.js';
	import { mergeCssStyle, toCssStyle } from '../internal/css-style.js';
	import type { SliderIndicatorProps, SliderRootState } from './types.js';

	let { render, children, style, ...elementProps }: SliderIndicatorProps = $props();

	const model = useSliderContext();
	const state: SliderRootState = $derived(model.snapshot());
	const values = $derived(model.values);
	const range = $derived(values.length > 1);
	const indicatorStyle = $derived(
		toCssStyle(
			getIndicatorStyles(
				model.vertical,
				range,
				model.inset,
				model.inset ? model.indicatorPosition[0] : valueToPercent(values[0], model.min, model.max),
				model.inset
					? model.indicatorPosition[1]
					: valueToPercent(values[values.length - 1], model.min, model.max),
				model.inset && model.renderBeforeHydration && model.hydrating
			)
		)
	);

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, sliderStateAttributes),
		...(model.renderBeforeHydration ? { 'data-base-ui-slider-indicator': '' } : {}),
		style: mergeCssStyle(indicatorStyle, style)
	});
</script>

<PartHost tag="div" {render} {children} elementProps={hostProps} partState={state} />
