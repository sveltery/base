<!--
	Positions the tooltip against the trigger. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/tooltip/positioner/TooltipPositioner.tsx
	and packages/react/src/utils/usePositioner.ts
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupStateMapping, AnchorPositioning } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { POPUP_COLLISION_AVOIDANCE } from './constants.js';
	import { setTooltipPositioner, useTooltipPortal, useTooltipRoot } from './context.svelte.js';
	import type { TooltipPositionerProps, TooltipPositionerState } from './types.js';

	let {
		anchor = undefined,
		positionMethod = undefined,
		side = 'top',
		align = undefined,
		sideOffset = undefined,
		alignOffset = undefined,
		collisionBoundary = 'clipping-ancestors',
		collisionPadding = undefined,
		arrowPadding = undefined,
		sticky = undefined,
		disableAnchorTracking = false,
		collisionAvoidance = POPUP_COLLISION_AVOIDANCE,
		render,
		children,
		...elementProps
	}: TooltipPositionerProps = $props();

	const store = useTooltipRoot();
	useTooltipPortal();
	const attachKey = createAttachmentKey();

	const positioning = new AnchorPositioning(store, () => ({
		anchor,
		positionMethod,
		side,
		align,
		sideOffset,
		alignOffset,
		collisionBoundary,
		collisionPadding,
		arrowPadding,
		sticky,
		disableAnchorTracking,
		collisionAvoidance,
		mounted: store.mounted,
		adaptiveOrigin: store.adaptiveOrigin
	}));
	setTooltipPositioner(positioning);
	$effect(() => {
		store.placement = positioning.physicalSide;
	});

	const state: TooltipPositionerState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden,
		instant: store.trackCursorAxis !== 'none' ? 'tracking-cursor' : store.instantType
	});

	const inert = $derived(
		!store.open || store.trackCursorAxis === 'both' || store.disableHoverablePopup
	);

	const hostProps = $derived(
		mergeProps(
			{
				role: 'presentation' as const,
				hidden: store.mounted ? undefined : true,
				style: toCssStyle({
					...positioning.positionerStyles,
					...store.positionerVars,
					...(inert ? { pointerEvents: 'none' } : {}),
					...(store.transitionStatus === 'starting' ? { transition: 'none' } : {})
				}),
				...getStateAttributesProps(state, popupStateMapping),
				[attachKey]: positioning.positionerProps.attach
			},
			elementProps
		)
	);
</script>

{#if render}{@render render(hostProps, state, children)}{:else}<div {...hostProps}>
		{@render children?.()}
	</div>{/if}
