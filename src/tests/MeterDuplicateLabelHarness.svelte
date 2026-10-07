<script lang="ts">
	import { Meter } from '#lib';

	let mode = $state<'old' | 'both' | 'new'>('old');
</script>

<Meter.Root value={50}>
	{#if mode !== 'new'}
		<Meter.Label id="old-label">Old</Meter.Label>
	{/if}
	{#if mode !== 'old'}
		<Meter.Label id="new-label">New</Meter.Label>
	{/if}
</Meter.Root>
<button type="button" onclick={() => (mode = 'both')}>Show both</button>
<button type="button" onclick={() => (mode = 'new')}>Drop old</button>
