<script lang="ts">
	import FloatingDelayGroup from '../../components/FloatingDelayGroup.svelte';
	import type { Delay } from '../../components/delay-group.svelte.js';
	import DelayGroupTooltip from './DelayGroupTooltip.svelte';

	let {
		delay,
		timeoutMs,
		grouped = true,
		labels = ['one', 'two', 'three']
	}: { delay: Delay; timeoutMs?: number; grouped?: boolean; labels?: string[] } = $props();
</script>

{#snippet tooltips()}
	{#each labels as label (label)}
		<DelayGroupTooltip {label} />
	{/each}
{/snippet}

{#if grouped}
	<FloatingDelayGroup {delay} {timeoutMs}>
		{@render tooltips()}
	</FloatingDelayGroup>
{:else}
	{@render tooltips()}
{/if}
