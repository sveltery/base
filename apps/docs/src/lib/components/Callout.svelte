<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title?: string; children: Snippet } = $props();
</script>

<aside class="callout my-6 rounded-lg border border-line bg-subtle px-4 py-3">
	{#if title}<p class="font-medium">{title}</p>{/if}
	{@render children()}
</aside>
