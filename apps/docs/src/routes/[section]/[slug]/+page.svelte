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

<div class="flex">
	<article class="mx-auto w-full max-w-3xl min-w-0 px-6 py-10">
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
	<aside
		class="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-y-auto py-10 pr-4 xl:block"
	>
		<Toc toc={data.metadata.toc} />
	</aside>
</div>
