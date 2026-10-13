<!--
	A description that describes the toast. Can be used as the default message for the toast
	when no title is provided. Renders a `<p>` element.
	Derived from Base UI v1.9.0 packages/react/src/toast/description/ToastDescription.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import ToastLabel from './ToastLabel.svelte';
	import type { ToastDescriptionProps } from './types.js';

	let { render, children, id, ...elementProps }: ToastDescriptionProps = $props();
</script>

<ToastLabel part="description" {id} {render} {children} {elementProps} />
