<script lang="ts">
	import { Progress } from '#lib';

	let { mode = 'old' }: { mode?: 'old' | 'both' | 'new' } = $props();
</script>

<Progress.Root value={40}>
	{#if mode !== 'new'}
		<Progress.Label id="old-label">Old</Progress.Label>
	{/if}
	{#if mode !== 'old'}
		<Progress.Label id="new-label">New</Progress.Label>
	{/if}
</Progress.Root>
