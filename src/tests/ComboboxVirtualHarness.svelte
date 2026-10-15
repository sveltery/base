<!--
	Spec harness for the `virtualized` and Item `index` cases of the Combobox and Autocomplete
	ports of Base UI v1.9.0 (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
	MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import { Autocomplete, Combobox } from '#lib';
	import ComboboxVirtualWindow from './ComboboxVirtualWindow.svelte';

	interface ExtraItem {
		text: string;
		value?: unknown;
		index?: number;
	}

	let {
		kind = 'combobox',
		root = {},
		windowStart = $bindable(0),
		windowSize = Infinity,
		indexed = true,
		follow = false,
		popup = true,
		trigger = false,
		extra = [],
		itemValue = (item: never) => item,
		itemText = (item: never) => String(item)
	}: {
		kind?: 'combobox' | 'autocomplete';
		root?: Record<string, unknown>;
		/** The first rendered item of the filtered list. */
		windowStart?: number;
		windowSize?: number;
		/** Whether each rendered item passes its position in the filtered list as `index`. */
		indexed?: boolean;
		/** Moves the window to each highlighted item, and back to the start when the list narrows. */
		follow?: boolean;
		/** `false` renders the list directly in the root. */
		popup?: boolean;
		/** Renders a trigger outside the popup and the input inside it. */
		trigger?: boolean;
		/** Items rendered after the window. */
		extra?: ExtraItem[];
		itemValue?: (item: never) => unknown;
		itemText?: (item: never) => string;
	} = $props();

	const parts = $derived(kind === 'autocomplete' ? Autocomplete : Combobox);
	const Item = $derived(parts.Item as unknown as Component<Record<string, unknown>>);
	const Root = $derived(parts.Root as unknown as Component<Record<string, unknown>>);

	function onItemHighlighted(item: unknown, details: { index: number }) {
		(root.onItemHighlighted as ((...args: unknown[]) => void) | undefined)?.(item, details);
		if (follow && item !== undefined) queueMicrotask(() => (windowStart = details.index));
	}
</script>

{#snippet list()}
	<Combobox.List data-testid="list">
		<ComboboxVirtualWindow
			{Item}
			bind:windowStart
			{windowSize}
			{indexed}
			{follow}
			{itemValue}
			{itemText}
		/>
		{#each extra as item (item.text)}
			<Item value={item.value} index={item.index}>{item.text}</Item>
		{/each}
	</Combobox.List>
{/snippet}

<Root {...root} {onItemHighlighted}>
	{#if trigger}
		<Combobox.Trigger data-testid="trigger"><Combobox.Value /></Combobox.Trigger>
	{:else}
		<Combobox.Input data-testid="input" />
	{/if}
	{#if popup}
		<Combobox.Portal>
			<Combobox.Positioner>
				<Combobox.Popup>
					{#if trigger}<Combobox.Input data-testid="input" />{/if}
					{@render list()}
				</Combobox.Popup>
			</Combobox.Positioner>
		</Combobox.Portal>
	{:else}
		{@render list()}
	{/if}
</Root>
