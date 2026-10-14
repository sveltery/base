<!--
	A visual separator between listbox items or groups. Renders a `<div>`.
	Derived from Base UI v1.9.0 packages/react/src/utils/listbox-separator/ListboxSeparator.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Shared by Select and Combobox. Built on Separator, which a listbox hides from the tree.
-->
<script lang="ts">
	import Separator from '../../separator/Separator.svelte';
	import type { SeparatorProps } from '../../separator/types.js';

	let props: SeparatorProps = $props();
</script>

<Separator role="presentation" aria-orientation={undefined} {...props} />
