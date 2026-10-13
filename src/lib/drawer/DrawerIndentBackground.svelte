<!--
	A background layer placed before Drawer.Indent. Renders a `<div>` element.
	`data-active` is present while any drawer inside the nearest Drawer.Provider is open.
	Derived from Base UI v1.9.0 packages/react/src/drawer/indent-background/DrawerIndentBackground.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { drawerIndentStateAttributesMapping } from './attributes.js';
	import { findDrawerProvider } from './context.svelte.js';
	import type {
		DrawerDivProps,
		DrawerIndentBackgroundProps,
		DrawerIndentBackgroundState
	} from './types.js';

	let { render, children, ...elementProps }: DrawerIndentBackgroundProps = $props();

	const provider = findDrawerProvider();
	const state: DrawerIndentBackgroundState = $derived({ active: provider?.active ?? false });
	const hostProps: DrawerDivProps = $derived({
		...elementProps,
		...getStateAttributesProps(state, drawerIndentStateAttributesMapping)
	});
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
