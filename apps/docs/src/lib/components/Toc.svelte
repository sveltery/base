<script lang="ts">
	import type { TocItem } from '#lib/docs/types.ts';

	let { toc }: { toc: TocItem[] } = $props();
	let activeId = $state<string>();

	// Highlight the heading nearest the top of the viewport.
	$effect(() => {
		activeId = undefined;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) if (entry.isIntersecting) activeId = entry.target.id;
			},
			{ rootMargin: '0% 0% -80% 0%' }
		);
		for (const item of toc) {
			const heading = document.getElementById(item.url.slice(1));
			if (heading) observer.observe(heading);
		}
		return () => observer.disconnect();
	});
</script>

{#if toc.length}
	<nav aria-label="On this page" class="flex flex-col gap-1.5 text-sm">
		<p class="mb-1 text-xs font-medium text-muted">On this page</p>
		{#each toc as item (item.url)}
			<a
				href={item.url}
				aria-current={item.url === `#${activeId}` ? 'location' : undefined}
				class={[
					'text-muted hover:text-fg aria-[current]:font-medium aria-[current]:text-fg',
					item.depth === 3 && 'pl-3'
				]}
			>
				{item.title}
			</a>
		{/each}
	</nav>
{/if}
