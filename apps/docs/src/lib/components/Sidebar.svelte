<script lang="ts">
	import { page } from '$app/state';
	import type { NavSection } from '#lib/docs/types.ts';

	let { nav }: { nav: NavSection[] } = $props();
</script>

<nav aria-label="Documentation" class="flex flex-col gap-6 text-sm">
	{#each nav as section (section.title)}
		<div class="flex flex-col gap-0.5">
			<p class="mb-1 px-2 text-xs font-medium text-muted">{section.title}</p>
			{#each section.pages as item (item.href)}
				<a
					href={item.href}
					aria-current={page.url.pathname === item.href ? 'page' : undefined}
					class="rounded-md px-2 py-1 text-fg/80 hover:bg-subtle hover:text-fg aria-[current=page]:bg-subtle aria-[current=page]:font-medium aria-[current=page]:text-fg"
				>
					{item.title}
				</a>
			{/each}
		</div>
	{/each}
</nav>
