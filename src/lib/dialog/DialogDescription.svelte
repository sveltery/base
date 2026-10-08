<!--
	A paragraph with additional information about the dialog. Renders a `<p>` element.
	Derived from Base UI v1.8.0 packages/react/src/dialog/description/DialogDescription.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import DialogLabel from './DialogLabel.svelte';
	import type { DialogDescriptionProps } from './types.js';

	let { id, render, children, ...elementProps }: DialogDescriptionProps = $props();
</script>

<DialogLabel tag="p" part="description" {id} {render} {children} {elementProps} />
