<script lang="ts">
	import { Combobox } from '@sveltery/base/combobox';
	import styles from './index.module.css';
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
	<label class={styles.Label}>
		Search 10,000 items
		<Combobox.Input class={styles.Input} />
	</label>

	<Combobox.Portal>
		<Combobox.Positioner class={styles.Positioner} sideOffset={4}>
			<Combobox.Popup class={styles.Popup}>
				<Combobox.Empty>
					<div class={styles.Empty}>No items found.</div>
				</Combobox.Empty>
				<Combobox.List class={styles.List}>
					{@const filteredItems = Combobox.useFilteredItems<VirtualizedItem>().current}
					{#if filteredItems.length}
						{@const totalSize = $virtualizer.getTotalSize()}
						<div
							role="presentation"
							{@attach (element) => {
								scrollElement = element;
								get(virtualizer).setOptions({
									count: filteredItems.length
								});
								get(virtualizer).measure();
							}}
							class={styles.Scroller}
							style="--total-size: {totalSize}px"
						>
							<div
								role="presentation"
								class={styles.VirtualizedPlaceholder}
								style="height: {totalSize}px"
							>
								{#each $virtualizer.getVirtualItems() as virtualItem (virtualItem.key)}
									{@const item = filteredItems[virtualItem.index]}
									{#if item}
										<Combobox.Item
											index={virtualItem.index}
											data-index={virtualItem.index}
											{@attach $virtualizer.measureElement}
											value={item}
											class={styles.Item}
											aria-setsize={filteredItems.length}
											aria-posinset={virtualItem.index + 1}
											style="position: absolute; top: 0; left: 0; width: 100%; height: {virtualItem.size}px; transform: translateY({virtualItem.start}px)"
										>
											<Combobox.ItemIndicator class={styles.ItemIndicator}>
												{@render CheckIcon()}
											</Combobox.ItemIndicator>
											<span class={styles.ItemText}>{item.name}</span>
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
