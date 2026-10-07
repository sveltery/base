<script lang="ts">
	import { Meter } from '#lib';

	let labelId = $state('label-a');
	let showLabel = $state(true);
</script>

<Meter.Root value={50}>
	{#if showLabel}
		<Meter.Label id={labelId}>Battery level</Meter.Label>
	{/if}
</Meter.Root>
<button type="button" onclick={() => (labelId = 'label-b')}>Change id</button>
<button type="button" onclick={() => (showLabel = false)}>Remove label</button>
