<!--
	A heading that labels the popover. Renders an `<h2>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/title/PopoverTitle.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import PopoverLabel from './PopoverLabel.svelte';
	import type { PopoverTitleProps } from './types.js';

	let { render, children, id, ...elementProps }: PopoverTitleProps = $props();
</script>

<PopoverLabel part="title" tag="h2" {id} {render} {children} {elementProps} />
