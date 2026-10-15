<!--
	Spec harness for the Combobox port of Base UI v1.9.0
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Renders a window of the filtered items, the way an external virtualizer does.
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import { Combobox } from '#lib';

	let {
		Item,
		windowStart = $bindable(0),
		windowSize,
		indexed,
		follow,
		itemValue,
		itemText
	}: {
		Item: Component<Record<string, unknown>>;
		windowStart?: number;
		windowSize: number;
		indexed: boolean;
		follow: boolean;
		itemValue: (item: never) => unknown;
		itemText: (item: never) => string;
	} = $props();

	const filtered = Combobox.useFilteredItems<never>();
	const total = filtered.current.length;
	const rendered = $derived(filtered.current.slice(windowStart, windowStart + windowSize));

	// A narrowed list scrolls back to its start.
	$effect(() => {
		if (follow && filtered.current.length < total) windowStart = 0;
	});
</script>

{#each rendered as item, offset (item)}
	<Item value={itemValue(item)} index={indexed ? windowStart + offset : undefined}
		>{itemText(item)}</Item
	>
{/each}
