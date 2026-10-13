<!--
	A container for the navigation menu contents. Renders a `<nav>` element.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/popup/NavigationMenuPopup.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { toCssStyle } from '../internal/css-style.js';
	import { useDirection } from '../internal/direction-context.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupTransitionStateMapping } from '../internal/popupStateMapping.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { useNavigationMenuPositioner, useNavigationMenuRoot } from './context.svelte.js';
	import type { NavigationMenuPopupProps, NavigationMenuPopupState } from './types.js';

	let { id, render, children, ...elementProps }: NavigationMenuPopupProps = $props();

	const uid = $props.id();
	const root = useNavigationMenuRoot();
	const positioning = useNavigationMenuPositioner();
	const reading = useDirection();
	const bindKey = createAttachmentKey();

	function bindPopup(node: HTMLElement) {
		root.popupElement = node;
		return () => {
			if (root.popupElement !== node) return;
			root.popupElement = null;
			root.popupVars.clear();
		};
	}

	const state: NavigationMenuPopupState = $derived({
		open: root.open,
		transitionStatus: root.transitionStatus,
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden
	});

	// A popup on the top or left side grows from its far edge, so its size transitions stay anchored.
	const isPhysicalLeft = $derived(
		positioning.side === 'left' ||
			positioning.side === (reading.direction === 'rtl' ? 'inline-end' : 'inline-start')
	);
	const isOriginSide = $derived(positioning.side === 'top' || isPhysicalLeft);

	const hostProps = $derived(
		mergeProps(
			{
				id: id ?? `base-ui-${uid}`,
				tabindex: -1,
				style: toCssStyle({
					...root.popupVars.values,
					...(isOriginSide
						? {
								position: 'absolute',
								[positioning.side === 'top' ? 'bottom' : 'top']: '0',
								[isPhysicalLeft ? 'right' : 'left']: '0'
							}
						: {}),
					...(root.transitionStatus === 'starting' ? { transition: 'none' } : {})
				}),
				...getStateAttributesProps(state, popupTransitionStateMapping),
				[bindKey]: bindPopup
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, state, children)}
{:else}
	<nav {...hostProps}>{@render children?.()}</nav>
{/if}
