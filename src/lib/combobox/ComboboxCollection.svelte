<!--
	Renders filtered list items.
	Doesn't render its own HTML element.

	If rendering a flat list, pass a function child to the `List` component instead, which implicitly wraps it.
	Derived from Base UI v1.9.0 packages/react/src/combobox/collection/ComboboxCollection.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { findComboboxGroup, useComboboxRoot } from './context.svelte.js';
	import type { ComboboxCollectionProps } from './types.js';

	let { children }: ComboboxCollectionProps = $props();

	const store = useComboboxRoot();
	const group = findComboboxGroup();
	const items = $derived((group?.items ?? store.filteredItems) as readonly never[]);
</script>

{#each items as item, index (item)}
	{@render children(item, index)}
{/each}
