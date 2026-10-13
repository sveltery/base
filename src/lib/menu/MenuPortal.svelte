<!--
	A portal element that moves the popup to a different part of the DOM.
	By default, the portal element is appended to `<body>`.
	Derived from Base UI v1.9.0 packages/react/src/menu/portal/MenuPortal.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	The hidden `aria-owns` owner (`portalOwnerRole`) is not ported: the shared FloatingPortal
	does not render one.
-->
<script lang="ts">
	import { FloatingPortal } from '@sveltery/floating-ui-svelte';
	import { setMenuPortal, useMenuRoot } from './context.svelte.js';
	import type { MenuPortalProps } from './types.js';

	let { keepMounted = false, container = undefined, children, ...rest }: MenuPortalProps = $props();

	const { store } = useMenuRoot();
	const shouldRender = $derived(store.mounted || keepMounted);

	setMenuPortal({
		get keepMounted() {
			return keepMounted;
		}
	});
</script>

{#if shouldRender}
	<FloatingPortal {...rest} {store} {container}>
		{@render children?.()}
	</FloatingPortal>
{/if}
