<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { get } from 'svelte/store';

	interface VirtualizedItem {
		id: string;
		name: string;
	}

	const virtualizedItems: VirtualizedItem[] = Array.from({ length: 10000 }, (_, index) => {
		const id = String(index + 1);
		const indexLabel = id.padStart(4, '0');
		return { id, name: `Item ${indexLabel}` };
	});

	function getItemLabel(item: VirtualizedItem | null) {
		return item ? item.name : '';
	}
	let open = $state(false);

	let scrollElement = $state<HTMLDivElement | null>(null);

	const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
		count: virtualizedItems.length,
		getScrollElement: () => scrollElement,
		estimateSize: () => 32,
		overscan: 20,
		paddingStart: 4,
		paddingEnd: 4,
		scrollPaddingStart: 4,
		scrollPaddingEnd: 4
	});
</script>

{#snippet CheckIcon()}
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		stroke="currentColor"
		style="display: block"
	>
		<path d="m2.5 8.5 4 4 7-9" />
	</svg>
{/snippet}

<Combobox.Root
	virtualized
	items={virtualizedItems}
	bind:open
	itemToStringLabel={getItemLabel}
	onItemHighlighted={(item, { reason, index }) => {
		if (!item) {
			return;
		}

		const isStart = index === 0;
		const isEnd = index === $virtualizer.options.count - 1;
		const shouldScroll = reason === 'none' || (reason === 'keyboard' && (isStart || isEnd));

		if (shouldScroll) {
			queueMicrotask(() => {
				$virtualizer.scrollToIndex(index, { align: isEnd ? 'start' : 'end' });
			});
		}
	}}
>
	<label class="flex flex-col gap-1 text-sm leading-5 font-bold text-neutral-950 dark:text-white">
		Search 10,000 items
		<Combobox.Input
			class="h-8 w-64 border border-neutral-950 bg-white dark:bg-neutral-950 px-2 text-sm any-pointer-coarse:text-base font-normal text-neutral-950 focus:outline-2 focus:-outline-offset-1 focus:outline-neutral-950 dark:focus:outline-white dark:border-white dark:text-white"
		/>
	</label>

	<Combobox.Portal>
		<Combobox.Positioner class="outline-none" sideOffset={4}>
			<Combobox.Popup
				class="w-[var(--anchor-width)] max-w-[var(--available-width)] border border-neutral-950 bg-white text-neutral-950 shadow-[0.25rem_0.25rem_0_rgb(0_0_0_/_12%)] dark:border-white dark:bg-neutral-950 dark:text-white dark:shadow-none"
			>
				<Combobox.Empty>
					<div class="py-3 px-2 text-sm leading-4 text-neutral-500 dark:text-neutral-400">
						No items found.
					</div>
				</Combobox.Empty>
				<Combobox.List class="p-0">
					{@const filteredItems = Combobox.useFilteredItems<VirtualizedItem>().current}
					{#if filteredItems.length}
						{@const totalSize = $virtualizer.getTotalSize()}
						<div
							role="presentation"
							{@attach (element) => {
								scrollElement = element;
								get(virtualizer).setOptions({
									enabled: open,
									count: filteredItems.length
								});
								get(virtualizer).measure();
							}}
							class="h-[min(22.5rem,var(--total-size))] max-h-[var(--available-height)] overflow-auto overscroll-contain scroll-py-1"
							style="--total-size: {totalSize}px"
						>
							<div role="presentation" class="relative w-full" style="height: {totalSize}px">
								{#each $virtualizer.getVirtualItems() as virtualItem (virtualItem.key)}
									{@const item = filteredItems[virtualItem.index]}
									{#if item}
										<Combobox.Item
											index={virtualItem.index}
											data-index={virtualItem.index}
											{@attach $virtualizer.measureElement}
											value={item}
											class="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 p-2 text-sm leading-4 outline-none select-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-white data-highlighted:before:absolute data-highlighted:before:inset-0 data-highlighted:before:z-[-1] data-highlighted:before:bg-neutral-950 dark:data-highlighted:text-neutral-950 dark:data-highlighted:before:bg-white"
											aria-setsize={filteredItems.length}
											aria-posinset={virtualItem.index + 1}
											style="position: absolute; top: 0; left: 0; width: 100%; height: {virtualItem.size}px; transform: translateY({virtualItem.start}px)"
										>
											<Combobox.ItemIndicator class="col-start-1">
												{@render CheckIcon()}
											</Combobox.ItemIndicator>
											<span class="col-start-2">{item.name}</span>
										</Combobox.Item>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				</Combobox.List>
			</Combobox.Popup>
		</Combobox.Positioner>
	</Combobox.Portal>
</Combobox.Root>
