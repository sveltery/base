<script lang="ts">
	import { ScrollArea } from '@sveltery/base/scroll-area';
	import type { TocItem } from '#lib/docs/types.ts';

	let { title, toc }: { title: string; toc: TocItem[] } = $props();

	type Entry = TocItem & { children: TocItem[] };

	const entries = $derived(
		toc.reduce<Entry[]>((list, item) => {
			const parent = list.at(-1);
			if (item.depth > 2 && parent) parent.children.push(item);
			else list.push({ ...item, children: [] });
			return list;
		}, [])
	);
</script>

{#if toc.length}
	<nav aria-label="On this page" class="QuickNavRoot">
		<div class="QuickNavInner">
			<ScrollArea.Root>
				<ScrollArea.Viewport class="QuickNavViewport">
					<header class="sr-only">{title}</header>
					<ul class="QuickNavList">
						<li><a class="QuickNavLink" href="#top">(Top)</a></li>
						{#each entries as entry (entry.url)}
							<li>
								<a class="QuickNavLink" href={entry.url}>{entry.title}</a>
								{#if entry.children.length}
									<ul class="QuickNavList">
										{#each entry.children as child (child.url)}
											<li><a class="QuickNavLink" href={child.url}>{child.title}</a></li>
										{/each}
									</ul>
								{/if}
							</li>
						{/each}
					</ul>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar class="QuickNavScrollbar" orientation="vertical">
					<ScrollArea.Thumb class="QuickNavScrollbarThumb" />
				</ScrollArea.Scrollbar>
			</ScrollArea.Root>
		</div>
	</nav>
{/if}

<style>
	.QuickNavRoot {
		--quick-nav-margin-x: 2rem;
		--quick-nav-scrollbar-thumb-width: 0.25rem;
		--quick-nav-scrollbar-width: 1.5rem;
		--quick-nav-item-height: 1.75rem;
		--quick-nav-item-line-height: 1.375rem;
		--quick-nav-item-padding-y: calc(
			var(--quick-nav-item-height) / 2 - var(--quick-nav-item-line-height) / 2
		);

		font-size: var(--font-size-14);
		line-height: 1.375rem;
		z-index: 1;
		display: none;

		@media (width >= 84rem) {
			display: block;
			position: fixed;
			top: var(--header-height);
			right: max(
				var(--root-layout-padding-x),
				calc(50% - var(--breakpoint-max-layout-width) / 2 + var(--root-layout-padding-x))
			);
			width: calc(var(--sidebar-width) - var(--quick-nav-margin-x));
		}
	}

	.QuickNavInner {
		position: relative;
		width: 100%;
	}

	.QuickNavRoot :global(.QuickNavViewport) {
		max-height: calc(100dvh - var(--header-height));
		padding: 0 0 0.75rem;
		outline: 0;

		&:focus-visible {
			outline: 2px solid var(--gray-t2);
			outline-offset: -2px;
		}
	}

	.QuickNavRoot :global(.QuickNavScrollbar) {
		display: flex;
		padding-block: 0.25rem;
		width: var(--quick-nav-scrollbar-width);
		opacity: 0;
		transition: opacity 200ms 500ms;

		&:active,
		&:global([data-scrolling]) {
			transition-duration: 0ms;
			transition-delay: 0ms;
			opacity: 1;
		}
	}

	.QuickNavRoot :global(.QuickNavViewport:focus-visible + .QuickNavScrollbar) {
		transition-duration: 0ms;
		transition-delay: 0ms;
		opacity: 1;
	}

	.QuickNavRoot :global(.QuickNavScrollbarThumb) {
		display: flex;
		justify-content: center;
		width: 100%;

		&::before {
			content: '';
			display: block;
			height: 100%;
			width: var(--quick-nav-scrollbar-thumb-width);
			border-radius: var(--radius-4);
			background-color: var(--gray-p2);
		}
	}

	.QuickNavList {
		color: var(--gray-t1);
		display: flex;
		flex-direction: column;
		align-items: start;

		& & {
			padding-left: 0.75rem;
		}
	}

	.QuickNavLink {
		display: inline-flex;
		padding: var(--quick-nav-item-padding-y) 0.5rem;
		border-radius: var(--radius-6);

		&:focus-visible {
			z-index: 1;
			outline: 2px solid var(--gray-t2);
			outline-offset: -2px;
		}

		@media (hover: hover) {
			&:hover {
				text-decoration: underline;
				text-underline-offset: 2px;
				text-decoration-thickness: 1px;
				text-decoration-color: var(--gray-p1);
			}
		}
	}
</style>
