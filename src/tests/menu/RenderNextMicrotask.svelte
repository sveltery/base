<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
	let ready = $state(false);

	onMount(() => queueMicrotask(() => (ready = true)));
</script>

{#if ready}{@render children()}{/if}
