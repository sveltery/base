<!--
	An item in the list. Pressing it fills the input with its text. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/autocomplete/item/AutocompleteItem.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	`index` is not ported: items register in document order.
-->
<script lang="ts">
	import ComboboxItem from '../combobox/ComboboxItem.svelte';
	import type { AutocompleteItemProps } from './types.js';

	let { ...props }: AutocompleteItemProps = $props();
</script>

<ComboboxItem {...props} />
