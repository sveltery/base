<script lang="ts">
	import { Checkbox } from '#lib';

	let { bound = true }: { bound?: boolean } = $props();
	let checked = $state(false);
</script>

<input type="checkbox" aria-label="Owner checked" bind:checked />
{#if bound}
	<Checkbox.Root bind:checked>Notifications</Checkbox.Root>
{:else}
	<Checkbox.Root {checked}>Notifications</Checkbox.Root>
{/if}
