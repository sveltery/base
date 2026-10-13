<script lang="ts">
	import { Combobox, type ComboboxRootProps } from '#lib';

	let {
		inputValue = $bindable(''),
		layout = 'list',
		items,
		filteredItems,
		staticItems,
		root = {},
		listStyle = 'max-height: 100px; overflow-y: auto',
		itemStyle
	}: {
		inputValue?: string;
		/**
		 * `list` scrolls the list, `viewport` a wrapper in the popup, `clip` a wrapper above a
		 * clipping one, `inline-dialog` an inline list's wrapper in a scrolling dialog, and
		 * `portal-dialog` a popup portaled into a scrolling dialog.
		 */
		layout?: 'list' | 'viewport' | 'clip' | 'inline-dialog' | 'portal-dialog';
		items?: string[];
		filteredItems?: (inputValue: string) => string[];
		/** Rendered as items without the root's `items` prop, filtered by the input value. */
		staticItems?: (inputValue: string) => string[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- specs pass typed callbacks
		root?: Partial<ComboboxRootProps<any, boolean, any>> & Record<string, unknown>;
		listStyle?: string;
		itemStyle?: string;
	} = $props();

	let dialog = $state<HTMLElement>();
	const inline = $derived(layout === 'inline-dialog');
	const listProps = $derived(
		layout === 'list' ? listStyle : layout === 'viewport' ? 'overflow-y: auto' : undefined
	);
</script>

{#snippet list()}
	<Combobox.List data-testid="list" style={listProps}>
		{#if staticItems}
			{#each staticItems(inputValue) as item (item)}
				<Combobox.Item value={item} style={itemStyle}>{item}</Combobox.Item>
			{/each}
		{:else}
			<Combobox.Collection>
				{#snippet children(item: string)}
					<Combobox.Item value={item} style={itemStyle}>{item}</Combobox.Item>
				{/snippet}
			</Combobox.Collection>
		{/if}
	</Combobox.List>
{/snippet}

{#snippet popupList()}
	{#if layout === 'viewport'}
		<div data-testid="viewport" style="max-height: 100px; overflow-y: auto">{@render list()}</div>
	{:else if layout === 'clip'}
		<div data-testid="viewport" style="height: 100px; overflow-y: auto">
			<div style="overflow-y: clip">{@render list()}</div>
		</div>
	{:else}
		{@render list()}
	{/if}
{/snippet}

<Combobox.Root
	bind:inputValue
	{inline}
	{...items ? { items } : {}}
	{...filteredItems ? { filteredItems: filteredItems(inputValue) } : {}}
	{...root}
>
	{#if layout === 'inline-dialog' || layout === 'portal-dialog'}
		<div
			bind:this={dialog}
			role="dialog"
			data-testid="dialog"
			style="height: 80px; overflow-y: auto; overflow-anchor: none"
		>
			<div style="height: 100px"></div>
			<Combobox.Input data-testid="input" />
			{#if inline}
				<div data-testid="viewport" style="height: 100px; overflow-y: auto">{@render list()}</div>
			{:else if dialog}
				<Combobox.Portal container={dialog}>
					<Combobox.Positioner>
						<Combobox.Popup>{@render list()}</Combobox.Popup>
					</Combobox.Positioner>
				</Combobox.Portal>
			{/if}
		</div>
	{:else}
		<Combobox.Input data-testid="input" />
		<Combobox.Portal>
			<Combobox.Positioner>
				<Combobox.Popup>{@render popupList()}</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	{/if}
</Combobox.Root>
