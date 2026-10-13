<!--
	Scrolls the select list up while the pointer rests on it. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/select/scroll-up-arrow/SelectScrollUpArrow.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import SelectScrollArrow from './SelectScrollArrow.svelte';
	import type { SelectScrollArrowProps } from './types.js';

	let props: SelectScrollArrowProps = $props();
</script>

<SelectScrollArrow {...props} direction="up" />
