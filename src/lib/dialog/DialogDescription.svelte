<!--
	A paragraph with additional information about the dialog. Renders a `<p>` element.
	Derived from Base UI v1.9.0 packages/react/src/dialog/description/DialogDescription.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import DialogLabel from './DialogLabel.svelte';
	import type { DialogDescriptionProps } from './types.js';

	let { id, render, children, ...elementProps }: DialogDescriptionProps = $props();
</script>

<DialogLabel tag="p" part="description" {id} {render} {children} {elementProps} />
