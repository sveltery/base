<!--
	Indicates whether the item is selected. Renders a `<span>` element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/item-indicator/ComboboxItemIndicator.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import ItemIndicator from '../internal/listbox/ItemIndicator.svelte';
	import { useComboboxItem } from './context.svelte.js';
	import type { ComboboxItemIndicatorProps } from './types.js';

	let { keepMounted = false, ...props }: ComboboxItemIndicatorProps = $props();

	const item = useComboboxItem();
</script>

{#if keepMounted || item.selected}
	<ItemIndicator {...props} selected={item.selected} />
{/if}
