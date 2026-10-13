<!--
	Positions the navigation menu against the currently active trigger. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/navigation-menu/positioner/NavigationMenuPositioner.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts">
	import { flushSync } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { on } from 'svelte/events';
	import {
		disableFocusInside,
		enableFocusInside,
		isOutsideEvent
	} from '@sveltery/floating-ui-svelte';
	import { ownerWindow, ScopedTimeout } from '@sveltery/utils';
	import { adaptiveOriginMiddleware } from '../internal/adaptiveOriginMiddleware.js';
	import { toCssStyle } from '../internal/css-style.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { AnchorPositioning, popupStateMapping } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import { DROPDOWN_COLLISION_AVOIDANCE, POPUP_COLLISION_AVOIDANCE } from './constants.js';
	import {
		setNavigationMenuPositioner,
		useNavigationMenuPortal,
		useNavigationMenuRoot
	} from './context.svelte.js';
	import type { NavigationMenuPositionerProps, NavigationMenuPositionerState } from './types.js';

	const root = useNavigationMenuRoot();

	let {
		anchor = undefined,
		positionMethod = 'absolute',
		side = 'bottom',
		align = 'center',
		sideOffset = 0,
		alignOffset = 0,
		collisionBoundary = 'clipping-ancestors',
		collisionPadding = 5,
		collisionAvoidance = root.nested ? POPUP_COLLISION_AVOIDANCE : DROPDOWN_COLLISION_AVOIDANCE,
		arrowPadding = 5,
		sticky = false,
		disableAnchorTracking = false,
		render,
		children,
		...elementProps
	}: NavigationMenuPositionerProps = $props();

	useNavigationMenuPortal();
	const initialInstantTimeout = new ScopedTimeout();
	const resizeTimeout = new ScopedTimeout();

	// A menu that starts open skips the transition for one task, so a default value does not
	// animate in from the unpositioned portal state.
	let instant = $state(root.open);
	let needsInitialInstantReset = root.open;

	const positioning = new AnchorPositioning(root.floating, () => ({
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
		mounted: root.mounted,
		shift: { rootBoundary: 'layoutViewport' },
		// Keeps the popup anchored while its size and position transition together on the top or left side.
		adaptiveOrigin: adaptiveOriginMiddleware
	}));
	setNavigationMenuPositioner(positioning);

	$effect(() => {
		root.positioning = positioning;
		return () => {
			if (root.positioning === positioning) root.positioning = null;
		};
	});

	$effect(() => {
		if (!root.open) return;
		if (needsInitialInstantReset) {
			initialInstantTimeout.start(0, () => {
				needsInitialInstantReset = false;
				if (!resizeTimeout.isStarted()) instant = false;
			});
		}
		return on(ownerWindow(root.positionerElement), 'resize', () => {
			instant = true;
			flushSync();
			resizeTimeout.start(100, () => {
				instant = false;
			});
		});
	});

	const attachKey = createAttachmentKey();
	const focusKey = createAttachmentKey();

	// Tabbables inside the portal stay out of the tab order until focus enters the positioner.
	function manageFocusInside(node: HTMLElement) {
		function onFocus(event: FocusEvent) {
			if (!isOutsideEvent(event)) return;
			if (event.type === 'focusin') enableFocusInside(node);
			else disableFocusInside(node);
		}
		const stopIn = on(node, 'focusin', onFocus, { capture: true });
		const stopOut = on(node, 'focusout', onFocus, { capture: true });
		return () => {
			stopIn();
			stopOut();
		};
	}

	const partState: NavigationMenuPositionerState = $derived({
		open: root.open,
		side: positioning.side,
		align: positioning.align,
		anchorHidden: positioning.anchorHidden,
		instant
	});

	const hostProps = $derived(
		mergeProps(
			{
				role: 'presentation' as const,
				hidden: root.mounted ? undefined : true,
				style: toCssStyle({
					...positioning.positionerStyles,
					...(root.open ? {} : { pointerEvents: 'none' }),
					...(root.transitionStatus === 'starting' ? { transition: 'none' } : {})
				}),
				...getStateAttributesProps(partState, popupStateMapping),
				[attachKey]: positioning.positionerProps.attach,
				[focusKey]: manageFocusInside
			},
			elementProps
		)
	);
</script>

{#if render}
	{@render render(hostProps, partState, children)}
{:else}
	<div {...hostProps}>{@render children?.()}</div>
{/if}
