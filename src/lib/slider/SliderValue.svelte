<!--
	Displays the current value of the slider as text.
	Renders an `<output>` element.
	Derived from Base UI v1.8.0 packages/react/src/slider/value/SliderValue.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import PartHost from '../internal/PartHost.svelte';
	import { formatNumber } from '../internal/formatNumber.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { sliderStateAttributes } from './attributes.js';
	import { useSliderContext } from './context.svelte.js';
	import type { SliderRootState, SliderValueProps } from './types.js';

	let {
		'aria-live': ariaLive = 'off',
		render,
		children: valueText,
		...elementProps
	}: SliderValueProps = $props();

	const model = useSliderContext();
	const state: SliderRootState = $derived(model.snapshot());
	const values = $derived(model.values);
	const formattedValues = $derived(
		values.map((value) => formatNumber(value, model.locale, model.format))
	);
	const defaultDisplay = $derived(formattedValues.join(' \u2013 '));

	const hostProps: HTMLAttributes<HTMLOutputElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, sliderStateAttributes),
		'aria-live': ariaLive,
		for: model.outputFor
	});
</script>

<PartHost tag="output" {render} elementProps={hostProps} partState={state}>
	{#if valueText}
		{@render valueText(formattedValues, values)}
	{:else}
		{defaultDisplay}
	{/if}
</PartHost>
