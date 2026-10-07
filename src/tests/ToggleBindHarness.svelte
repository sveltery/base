<script lang="ts">
	import { Toggle } from '#lib';

	let { bound = true }: { bound?: boolean } = $props();
	let pressed = $state(false);
</script>

<input type="checkbox" aria-label="Owner pressed" bind:checked={pressed} />
{#if bound}
	<Toggle bind:pressed>Bold</Toggle>
{:else}
	<Toggle {pressed}>Bold</Toggle>
{/if}
