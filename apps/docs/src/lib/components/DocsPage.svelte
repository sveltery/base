<script lang="ts">
	import type { Snippet } from 'svelte';
	import PageMeta from '#lib/components/PageMeta.svelte';
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

<PageMeta title="{title} · Sveltery Base" {description} group="docs" />

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
