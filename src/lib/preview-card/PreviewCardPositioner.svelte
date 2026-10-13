<!--
	Positions the popup against the trigger. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/preview-card/positioner/PreviewCardPositioner.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	A new inline middleware replaces the old one when the card opens, so the position
	is measured again with the line the pointer entered last.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { useFloatingNodeId } from '@sveltery/floating-ui-svelte';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { popupStateMapping, AnchorPositioning } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { POPUP_COLLISION_AVOIDANCE } from './constants.js';
	import {
		setPreviewCardPositioner,
		usePreviewCardPortal,
		usePreviewCardRoot
	} from './context.svelte.js';
	import { createInlineMiddleware } from './inline-rect.js';
	import type { PreviewCardPositionerProps, PreviewCardPositionerState } from './types.js';

	let {
		anchor = undefined,
		positionMethod = undefined,
		side = undefined,
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
	}: PreviewCardPositionerProps = $props();

	const store = usePreviewCardRoot();
	usePreviewCardPortal();
	useFloatingNodeId(store);
	const attachKey = createAttachmentKey();

	const opening = $derived(store.open && store.mounted);
	const inline = $derived.by(() => {
		void opening;
		return createInlineMiddleware(store.inlineHover);
	});

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
		adaptiveOrigin: store.adaptiveOrigin,
		inline
	}));
	setPreviewCardPositioner(positioning);
	$effect(() => {
		store.setPlacement(positioning.physicalSide);
	});

	const state: PreviewCardPositionerState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden,
		instant: store.instantType
	});

	const hostProps = $derived(
		mergeProps(
			{
				role: 'presentation' as const,
				hidden: store.mounted ? undefined : true,
				style: toCssStyle({
					...positioning.positionerStyles,
					...store.positionerVars,
					...(store.open ? {} : { pointerEvents: 'none' }),
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
