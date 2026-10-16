<!--
	The current value of the combobox.
	Doesn't render its own HTML element.
	Derived from Base UI v1.9.0 packages/react/src/combobox/value/ComboboxValue.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	A `children` snippet receives the value in place of the children function.
-->
<script lang="ts">
	import {
		hasNullItemLabel,
		resolveMultipleLabels,
		resolveSelectedLabel
	} from '../internal/listbox/resolveValueLabel.js';
	import { useComboboxRoot } from './context.svelte.js';
	import type { ComboboxValueProps } from './types.js';

	let { placeholder, children }: ComboboxValueProps = $props();

	const store = useComboboxRoot();

	const showPlaceholder = $derived(
		!store.hasSelectedValue &&
			placeholder != null &&
			children == null &&
			!hasNullItemLabel(store.labelItems as never)
	);

	const label = $derived.by(() => {
		const value = store.selectedValue;
		const items = store.labelItems as never;
		const toLabel = store.itemToStringLabel as never;
		if (store.selectionMode === 'multiple' && Array.isArray(value)) {
			return resolveMultipleLabels(value, items, toLabel);
		}
		return resolveSelectedLabel(value, items, toLabel);
	});
</script>

{#if children}
	{@render children(store.selectedValue)}
{:else if showPlaceholder}
	{placeholder}
{:else}
	{label}
{/if}
