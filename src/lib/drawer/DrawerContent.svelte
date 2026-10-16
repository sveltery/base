<!--
	A container for the drawer contents.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/drawer/content/DrawerContent.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { useDrawerRootState } from './root.svelte.js';
	import { DRAWER_CONTENT_ATTRIBUTE } from './attributes.js';
	import type { DrawerContentProps, DrawerContentState, DrawerDivProps } from './types.js';

	let { render, children, ...elementProps }: DrawerContentProps = $props();

	useDrawerRootState();
	const state: DrawerContentState = {};
	const hostProps: DrawerDivProps = $derived({ [DRAWER_CONTENT_ATTRIBUTE]: '', ...elementProps });
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
