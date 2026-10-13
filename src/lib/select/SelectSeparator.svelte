<!--
	A visual separator between select items or groups. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/separator/SelectSeparator.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import ListboxSeparator from '../internal/listbox/ListboxSeparator.svelte';
	import type { SelectSeparatorProps } from './types.js';

	let props: SelectSeparatorProps = $props();
</script>

<ListboxSeparator {...props} />
