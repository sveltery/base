<script lang="ts">
	import { Checkbox } from '#lib';

	let { bound = true }: { bound?: boolean } = $props();
	let checked = $state(false);
</script>

<input type="checkbox" aria-label="Owner checked" bind:checked />
{#if bound}
	<Checkbox.Root bind:checked aria-label="Notifications" />
{:else}
	<Checkbox.Root {checked} aria-label="Notifications" />
{/if}
