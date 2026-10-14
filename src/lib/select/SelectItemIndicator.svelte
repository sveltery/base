<!--
	Indicates whether the select item is selected. Renders a `<span>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/item-indicator/SelectItemIndicator.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import ItemIndicator from '../internal/listbox/ItemIndicator.svelte';
	import { useSelectItem } from './context.svelte.js';
	import type { SelectItemIndicatorProps } from './types.js';

	let { keepMounted = false, ...props }: SelectItemIndicatorProps = $props();

	const item = useSelectItem();
</script>

{#if keepMounted || item.selected}
	<ItemIndicator {...props} selected={item.selected} />
{/if}
