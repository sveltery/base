<script lang="ts">
	import { page } from '$app/state';
	import Toc from '#lib/components/Toc.svelte';

	let { data } = $props();

	const pages = $derived(data.nav.flatMap((section) => section.pages));
	const current = $derived(pages.findIndex((item) => item.href === page.url.pathname));
	const previous = $derived(current > 0 ? pages[current - 1] : undefined);
	const next = $derived(current >= 0 ? pages[current + 1] : undefined);
</script>

<svelte:head>
	<title>{data.metadata.title} · Sveltery Base</title>
	<meta name="description" content={data.metadata.description} />
</svelte:head>

<Toc title={data.metadata.title} toc={data.metadata.toc} />
<div class="QuickNavContent">
	<article>
		<h1 class="text-3xl font-semibold tracking-tight">{data.metadata.title}</h1>
		<p class="mt-2 text-lg text-muted">{data.metadata.description}</p>
		<div class="typeset mt-8">
			<data.content />
		</div>
		<nav aria-label="Pagination" class="mt-16 flex gap-4 border-t border-line pt-6 text-sm">
			{#if previous}
				<a href={previous.href} class="flex flex-col hover:underline">
					<span class="text-muted">Previous</span>{previous.title}
				</a>
			{/if}
			{#if next}
				<a href={next.href} class="ml-auto flex flex-col text-right hover:underline">
					<span class="text-muted">Next</span>{next.title}
				</a>
			{/if}
		</nav>
	</article>
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
