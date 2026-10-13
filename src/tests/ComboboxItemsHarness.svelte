<script lang="ts">
	import { Combobox } from '#lib';

	interface Group {
		value: string;
		items: unknown[];
	}

	let {
		collection,
		value = $bindable(),
		inputValue = $bindable(),
		open = $bindable(false),
		root = {},
		list = 'bare',
		itemValue = (item: never) => (item as { id: unknown }).id,
		itemText = (item: never) => (item as { name: string }).name,
		detail,
		grouped = false,
		groupLabels = true,
		explicitItems,
		noInput = false,
		trigger = false,
		valueText = false,
		placeholder,
		renderValue,
		second
	}: {
		collection: unknown;
		value?: unknown;
		inputValue?: string;
		open?: boolean;
		root?: Record<string, unknown>;
		/** `bare` renders the list in the root, `popup` in a popup, `none` renders no list. */
		list?: 'bare' | 'popup' | 'none';
		itemValue?: (item: never) => unknown;
		itemText?: (item: never) => string;
		/** Extra text spans after the item's name. */
		detail?: (item: never) => string[];
		/** Renders each entry as a group with its own collection. */
		grouped?: boolean;
		groupLabels?: boolean;
		/** Renders these items in place of `Combobox.Collection`. */
		explicitItems?: unknown[];
		noInput?: boolean;
		/** Renders a trigger that holds `Combobox.Value`. */
		trigger?: boolean;
		valueText?: boolean;
		/** Renders a second `Combobox.Value` with this placeholder. */
		placeholder?: string;
		renderValue?: (value: unknown) => string;
		/** Renders a second root over the same collection. */
		second?: { filteredItems: unknown[]; value: unknown };
	} = $props();
</script>

{#snippet item(entry: unknown)}
	{#if entry != null}
		<Combobox.Item value={itemValue(entry as never)}>
			{#if detail}
				<strong>{itemText(entry as never)}</strong>
				{#each detail(entry as never) as text (text)}<span>{text}</span>{/each}
			{:else}
				{itemText(entry as never)}
			{/if}
		</Combobox.Item>
	{/if}
{/snippet}

{#snippet entries()}
	{#if explicitItems}
		{#each explicitItems as entry, index (index)}{@render item(entry)}{/each}
	{:else if grouped}
		<Combobox.Collection>
			{#snippet children(group: Group)}
				<Combobox.Group items={group.items}>
					{#if groupLabels}<Combobox.GroupLabel>{group.value}</Combobox.GroupLabel>{/if}
					<Combobox.Collection>
						{#snippet children(entry: unknown)}{@render item(entry)}{/snippet}
					</Combobox.Collection>
				</Combobox.Group>
			{/snippet}
		</Combobox.Collection>
	{:else}
		<Combobox.Collection>
			{#snippet children(entry: unknown)}{@render item(entry)}{/snippet}
		</Combobox.Collection>
	{/if}
{/snippet}

<Combobox.Root items={collection as never} bind:value bind:inputValue bind:open {...root}>
	{#if !noInput}<Combobox.Input data-testid="input" />{/if}
	{#if valueText}
		<span data-testid="value">
			{#if renderValue}
				<Combobox.Value>
					{#snippet children(selected: unknown)}{renderValue(selected)}{/snippet}
				</Combobox.Value>
			{:else}
				<Combobox.Value />
			{/if}
		</span>
	{/if}
	{#if placeholder !== undefined}
		<span data-testid="placeholder"><Combobox.Value {placeholder} /></span>
	{/if}
	{#if trigger}
		<Combobox.Trigger data-testid="trigger"><Combobox.Value /></Combobox.Trigger>
	{/if}
	{#if list === 'bare'}
		<Combobox.List>{@render entries()}</Combobox.List>
	{:else if list === 'popup'}
		<Combobox.Portal>
			<Combobox.Positioner>
				<Combobox.Popup>
					<Combobox.List>{@render entries()}</Combobox.List>
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	{/if}
</Combobox.Root>
{#if second}
	<Combobox.Root
		items={collection as never}
		filteredItems={second.filteredItems}
		value={second.value}
	>
		<Combobox.Input data-testid="input-b" />
	</Combobox.Root>
{/if}
