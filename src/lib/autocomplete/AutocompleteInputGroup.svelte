<!--
	A wrapper for the input and its associated controls.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/autocomplete/input-group/AutocompleteInputGroup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import ComboboxInputGroup from '../combobox/ComboboxInputGroup.svelte';
	import type { AutocompleteInputGroupProps } from './types.js';

	let { ...props }: AutocompleteInputGroupProps = $props();
</script>

<ComboboxInputGroup {...props} />
