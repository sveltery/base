<!--
	Visualizes the position of the value along the range.
	Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/meter/indicator/MeterIndicator.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { useMeterRootContext } from './context.js';
	import type { MeterIndicatorProps, MeterIndicatorState } from './types.js';

	let { render, children, style, ...elementProps }: MeterIndicatorProps = $props();

	const meter = useMeterRootContext();
	const percentageValue = $derived(meter.percentageValue);
	const partState: MeterIndicatorState = {};

	// Consumer declarations come last so they override width, matching style-object merge.
	const hostProps: HTMLAttributes<HTMLDivElement> = $derived({
		style:
			style == null || style === ''
				? `inset-inline-start:0;height:inherit;width:${percentageValue}%`
				: `inset-inline-start:0;height:inherit;width:${percentageValue}%;${style}`,
		...elementProps
	});
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
