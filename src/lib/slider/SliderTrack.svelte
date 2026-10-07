<!--
	Contains the slider indicator and represents the entire range of the slider.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/slider/track/SliderTrack.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { sliderStateAttributes } from './attributes.js';
	import { useSliderContext } from './context.svelte.js';
	import { mergeCssStyle } from '../internal/css-style.js';
	import type { SliderRootState, SliderTrackProps } from './types.js';

	let { render, children, style, ...elementProps }: SliderTrackProps = $props();

	const model = useSliderContext();
	const state: SliderRootState = $derived(model.snapshot());

	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		...elementProps,
		...getStateAttributesProps(state, sliderStateAttributes),
		style: mergeCssStyle('position: relative', style)
	});
</script>

{#snippet content()}
	{@render children?.()}
{/snippet}

{#if render}
	{@render render(hostProps, state, content)}
{:else}
	<div {...hostProps}>{@render content()}</div>
{/if}
