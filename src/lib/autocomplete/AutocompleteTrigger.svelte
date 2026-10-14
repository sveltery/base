<!--
	A button that opens the popup. Renders a `<button>` element.
	Derived from Base UI v1.9.0 packages/react/src/autocomplete/trigger/AutocompleteTrigger.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import ComboboxTrigger from '../combobox/ComboboxTrigger.svelte';
	import type { AutocompleteTriggerProps } from './types.js';

	let { ...props }: AutocompleteTriggerProps = $props();
</script>

<ComboboxTrigger {...props} />
