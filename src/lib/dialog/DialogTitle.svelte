<!--
	A heading that labels the dialog. Renders an `<h2>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/title/DialogTitle.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import DialogLabel from './DialogLabel.svelte';
	import type { DialogTitleProps } from './types.js';

	let { id, render, children, ...elementProps }: DialogTitleProps = $props();
</script>

<DialogLabel tag="h2" part="title" {id} {render} {children} {elementProps} />
