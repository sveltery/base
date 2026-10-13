<!--
	A title that labels the toast. Renders an `<h2>` element.
	Derived from Base UI v1.9.0 packages/react/src/toast/title/ToastTitle.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import ToastLabel from './ToastLabel.svelte';
	import type { ToastTitleProps } from './types.js';

	let { render, children, id, ...elementProps }: ToastTitleProps = $props();
</script>

<ToastLabel part="title" {id} {render} {children} {elementProps} />
