<!--
	Spec probe for the Combobox port of Base UI v1.9.0
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { useComboboxRoot } from '../lib/combobox/context.svelte.js';

	const store = useComboboxRoot();
</script>

<div data-testid="active-index">{store.activeIndex === null ? 'null' : store.activeIndex}</div>
<div data-testid="selected-index">
	{store.selectedIndex === null ? 'null' : store.selectedIndex}
</div>
<button
	type="button"
	data-testid="clear-highlight"
	onclick={() => store.setIndices({ activeIndex: null })}>Clear highlight</button
>
