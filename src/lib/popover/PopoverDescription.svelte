<!--
	A paragraph with additional information about the popover. Renders a `<p>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/description/PopoverDescription.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import PopoverLabel from './PopoverLabel.svelte';
	import type { PopoverDescriptionProps } from './types.js';

	let { render, children, id, ...elementProps }: PopoverDescriptionProps = $props();
</script>

<PopoverLabel part="description" tag="p" {id} {render} {children} {elementProps} />
