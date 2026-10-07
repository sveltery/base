<script lang="ts">
	import { Switch } from '#lib';

	let { bound = true }: { bound?: boolean } = $props();
	let checked = $state(false);
</script>

<input type="checkbox" aria-label="Owner checked" bind:checked />
{#if bound}
	<Switch.Root bind:checked>Notifications</Switch.Root>
{:else}
	<Switch.Root {checked}>Notifications</Switch.Root>
{/if}
