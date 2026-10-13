<!--
	A portal element that moves the popup to a different part of the DOM.
	By default, the portal element is appended to `<body>`.
	Derived from Base UI v1.9.0 packages/react/src/tooltip/portal/TooltipPortal.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { FloatingPortal } from '@sveltery/floating-ui-svelte';
	import { setTooltipPortal, useTooltipRoot } from './context.svelte.js';
	import type { TooltipPortalProps } from './types.js';

	let {
		keepMounted = false,
		container = undefined,
		children,
		...rest
	}: TooltipPortalProps = $props();

	const store = useTooltipRoot();
	const shouldRender = $derived(store.mounted || keepMounted);

	setTooltipPortal(true);
</script>

{#if shouldRender}
	<FloatingPortal {...rest} {store} {container}>
		{@render children?.()}
	</FloatingPortal>
{/if}
