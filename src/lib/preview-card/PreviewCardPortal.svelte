<!--
	A portal element that moves the popup to a different part of the DOM.
	By default, the portal element is appended to `<body>`.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/preview-card/portal/PreviewCardPortal.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { FloatingPortal } from '@sveltery/floating-ui-svelte';
	import { setPreviewCardPortal, usePreviewCardRoot } from './context.svelte.js';
	import type { PreviewCardPortalProps } from './types.js';

	let {
		keepMounted = false,
		container = undefined,
		children,
		...rest
	}: PreviewCardPortalProps = $props();

	const store = usePreviewCardRoot();
	const shouldRender = $derived(store.mounted || keepMounted);

	setPreviewCardPortal(true);
</script>

{#if shouldRender}
	<FloatingPortal {...rest} {store} {container}>
		{@render children?.()}
	</FloatingPortal>
{/if}
