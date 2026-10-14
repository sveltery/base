<!--
	The text in the autocomplete's input. Renders no element.
	Derived from Base UI v1.9.0 packages/react/src/autocomplete/value/AutocompleteValue.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	A `children` snippet receives the text in place of the children function.
-->
<script lang="ts">
	import { useComboboxRoot } from '../combobox/context.svelte.js';
	import type { AutocompleteValueProps } from './types.js';

	let { children }: AutocompleteValueProps = $props();

	const store = useComboboxRoot();
	const value = $derived(String(store.inputValue));
</script>

{#if children}
	{@render children(value)}
{:else}
	{value}
{/if}
