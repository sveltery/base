<!--
	A heading that labels the popover. Renders an `<h2>` element.
	Derived from Base UI v1.9.0 packages/react/src/popover/title/PopoverTitle.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import PopoverLabel from './PopoverLabel.svelte';
	import type { PopoverTitleProps } from './types.js';

	let { render, children, id, ...elementProps }: PopoverTitleProps = $props();
</script>

<PopoverLabel part="title" tag="h2" {id} {render} {children} {elementProps} />
