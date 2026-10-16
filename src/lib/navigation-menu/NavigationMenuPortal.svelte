<!--
	A portal element that moves the popup to a different part of the DOM.
	By default, the portal element is appended to `<body>`.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/portal/NavigationMenuPortal.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { FloatingPortal } from '@sveltery/floating-ui-svelte';
	import { setNavigationMenuPortal, useNavigationMenuRoot } from './context.svelte.js';
	import type { NavigationMenuPortalProps } from './types.js';

	let {
		keepMounted = false,
		container = undefined,
		children,
		...rest
	}: NavigationMenuPortalProps = $props();

	const root = useNavigationMenuRoot();
	const shouldRender = $derived(root.mounted || keepMounted);

	setNavigationMenuPortal({
		get keepMounted() {
			return keepMounted;
		}
	});
</script>

{#if shouldRender}
	<FloatingPortal {...rest} store={root.floating} {container}>
		{@render children?.()}
	</FloatingPortal>
{/if}
