<!--
	Displays the current value of the slider as text.
	Renders an `<output>` element.
	Derived from Base UI v1.9.0 packages/react/src/slider/value/SliderValue.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
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

{#snippet content()}
	{#if valueText}
		{@render valueText(formattedValues, values)}
	{:else}
		{defaultDisplay}
	{/if}
{/snippet}

{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<output {...hostProps}>{@render content()}</output>
{/if}
