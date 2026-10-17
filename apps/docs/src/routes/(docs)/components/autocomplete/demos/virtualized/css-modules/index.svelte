<script lang="ts">
	import { Autocomplete } from '@sveltery/base/autocomplete';
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

<Autocomplete.Root
	virtualized
	items={virtualizedItems}
	openOnInputClick
	itemToStringValue={getItemLabel}
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
		<Autocomplete.Input class={styles.Input} />
	</label>

	<Autocomplete.Portal>
		<Autocomplete.Positioner class={styles.Positioner} sideOffset={4}>
			<Autocomplete.Popup class={styles.Popup}>
				<Autocomplete.Empty>
					<div class={styles.Empty}>No items found.</div>
				</Autocomplete.Empty>
				<Autocomplete.List class={styles.List}>
					{@const filteredItems = Autocomplete.useFilteredItems<VirtualizedItem>().current}
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
										<Autocomplete.Item
											index={virtualItem.index}
											data-index={virtualItem.index}
											{@attach $virtualizer.measureElement}
											value={item}
											class={styles.Item}
											aria-setsize={filteredItems.length}
											aria-posinset={virtualItem.index + 1}
											style="position: absolute; top: 0; left: 0; width: 100%; height: {virtualItem.size}px; transform: translateY({virtualItem.start}px)"
										>
											{item.name}
										</Autocomplete.Item>
									{/if}
								{/each}
							</div>
						</div>
					{/if}
				</Autocomplete.List>
			</Autocomplete.Popup>
		</Autocomplete.Positioner>
	</Autocomplete.Portal>
</Autocomplete.Root>
