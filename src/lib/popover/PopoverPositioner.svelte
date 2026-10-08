<!--
	Positions the popover against the trigger. Renders a `<div>` element.
	Derived from Base UI v1.8.0 packages/react/src/popover/positioner/PopoverPositioner.tsx
	(commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { createAttachmentKey } from 'svelte/attachments';
	import { REASONS } from '../internal/event-details.js';
	import { useFloatingNodeId } from '../internal/floating-ui/index.js';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import InternalBackdrop from '../internal/InternalBackdrop.svelte';
	import {
		popupStateMapping,
		useAnchorPositioning,
		useAnchoredPopupScrollLock
	} from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { POPUP_COLLISION_AVOIDANCE } from './constants.js';
	import { setPopoverPositioner, usePopoverPortal, usePopoverRoot } from './context.svelte.js';
	import type { PopoverPositionerProps, PopoverPositionerState } from './types.js';

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
	}: PopoverPositionerProps = $props();

	const store = usePopoverRoot();
	usePopoverPortal();
	useFloatingNodeId(store);
	const attachKey = createAttachmentKey();

	const positioning = useAnchorPositioning(store, () => ({
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
	setPopoverPositioner(positioning);
	store.hooks.placement = () => positioning.physicalSide;

	const modalLock = $derived(
		store.open && store.modal === true && store.openChangeReason !== REASONS.triggerHover
	);

	useAnchoredPopupScrollLock(() => ({
		enabled: modalLock,
		touchOpen: store.openMethod === 'touch',
		positionerElement: store.positionerElement,
		referenceElement: store.domReferenceElement
	}));

	const state: PopoverPositionerState = $derived({
		open: store.open,
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden,
		instant: store.instantType
	});

	const hostProps = $derived(
		mergeProps(elementProps, {
			role: 'presentation' as const,
			hidden: store.mounted ? undefined : true,
			style: toCssStyle({
				...positioning.positionerStyles,
				...store.positionerVars,
				...(store.open ? {} : { pointerEvents: 'none' })
			}),
			...getStateAttributesProps(state, popupStateMapping),
			[attachKey]: positioning.positionerProps.attach
		})
	);
</script>

{#if modalLock && store.mounted}
	<InternalBackdrop cutout={store.domReferenceElement} />
{/if}
{#snippet positionerBody()}{@render children?.()}{/snippet}
{#if render}{@render render(hostProps, state, positionerBody)}{:else}<div {...hostProps}>
		{@render positionerBody()}
	</div>{/if}
