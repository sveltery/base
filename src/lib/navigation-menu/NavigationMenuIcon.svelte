<!--
	An icon that indicates that the trigger button opens a menu.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/icon/NavigationMenuIcon.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { mergeProps } from '../internal/mergeProps.js';
	import { triggerOpenStateMapping } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useNavigationMenuItem, useNavigationMenuRoot } from './context.svelte.js';
	import type { NavigationMenuIconProps, NavigationMenuIconState } from './types.js';

	let { render, children, ...elementProps }: NavigationMenuIconProps = $props();

	const item = useNavigationMenuItem();
	const root = useNavigationMenuRoot();

	const state: NavigationMenuIconState = $derived({
		open: root.open && root.value === item.value
	});

	const hostProps = $derived(
		mergeProps(
			{
				'aria-hidden': true as const,
				...getStateAttributesProps(state, triggerOpenStateMapping)
			},
			elementProps
		)
	);
</script>

{#snippet glyph()}{#if children}{@render children()}{:else}▼{/if}{/snippet}

{#if render}
	{@render render(hostProps, state, glyph)}
{:else}
	<span {...hostProps}>{@render glyph()}</span>
{/if}
