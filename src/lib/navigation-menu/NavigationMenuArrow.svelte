<!--
	Displays an element pointing toward the navigation menu's current anchor.
	Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/arrow/NavigationMenuArrow.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupStateMapping } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useNavigationMenuPositioner, useNavigationMenuRoot } from './context.svelte.js';
	import type { NavigationMenuArrowProps, NavigationMenuArrowState } from './types.js';

	let { render, children, ...elementProps }: NavigationMenuArrowProps = $props();

	const root = useNavigationMenuRoot();
	const positioning = useNavigationMenuPositioner();
	const bindKey = createAttachmentKey();

	const state: NavigationMenuArrowState = $derived({
		open: root.open,
		side: positioning.side,
		align: positioning.align,
		uncentered: positioning.arrowUncentered
	});

	const hostProps = $derived(
		mergeProps(
			{
				style: toCssStyle({
					...positioning.arrowStyles,
					...(root.transitionStatus === 'starting' ? { transition: 'none' } : {})
				}),
				'aria-hidden': true as const,
				...getStateAttributesProps(state, popupStateMapping),
				[bindKey]: positioning.arrowProps.attach
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
