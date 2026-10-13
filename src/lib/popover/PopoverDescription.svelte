<!--
	A paragraph with additional information about the popover. Renders a `<p>` element.
	Derived from Base UI v1.9.0 packages/react/src/popover/description/PopoverDescription.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import PopoverLabel from './PopoverLabel.svelte';
	import type { PopoverDescriptionProps } from './types.js';

	let { render, children, id, ...elementProps }: PopoverDescriptionProps = $props();
</script>

<PopoverLabel part="description" tag="p" {id} {render} {children} {elementProps} />
