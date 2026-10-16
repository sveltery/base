<script lang="ts">
	import type { Snippet } from 'svelte';
	import Toc from '#lib/components/Toc.svelte';
	import type { TocItem } from '#lib/docs/types.ts';
	import '#lib/docs/css/index.css';

	// mdsvex wraps every `+page.md` in this layout and passes the page's metadata as props.
	let {
		title,
		description,
		toc,
		children
	}: { title: string; description: string; toc: TocItem[]; children: Snippet } = $props();
</script>

<svelte:head>
	<title>{title} · Sveltery Base</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>

<Toc {title} {toc} />
<div class="QuickNavContent">
	{@render children()}
</div>

<style>
	.QuickNavContent {
		padding-top: 1.5rem;
		padding-bottom: 4rem;

		@media (width >= 64rem) {
			padding-top: 0;
		}
	}
</style>
