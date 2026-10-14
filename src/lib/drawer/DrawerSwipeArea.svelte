<!--
	An invisible area that opens the drawer with a swipe. Renders a `<div>` element.
	Derived from Base UI v1.9.0 packages/react/src/drawer/swipe-area/DrawerSwipeArea.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	While the gesture runs it writes the popup's movement variables, and the popup leaves them alone.
-->
<script lang="ts" module>
	import type { SwipeDirection as Direction } from '../internal/useSwipeDismiss.svelte.js';

	const OPPOSITE: Record<Direction, Direction> = {
		up: 'down',
		down: 'up',
		left: 'right',
		right: 'left'
	};

	function opposite(direction: Direction): Direction {
		return OPPOSITE[direction];
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { createAttachmentKey } from 'svelte/attachments';
	import { createChangeEventDetails, ownerDocument, ownerWindow, REASONS } from '@sveltery/utils';
	import { isVirtualClick } from '@sveltery/floating-ui-svelte';
	import { getElementTransform } from '../internal/getElementTransform.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { registerTrigger } from '../internal/popups/index.js';
	import { getStateAttributesProps } from '../internal/state-attributes.js';
	import {
		getDisplacement,
		SwipeDismiss,
		type SwipeDirection
	} from '../internal/useSwipeDismiss.svelte.js';
	import {
		DrawerBackdropCssVars,
		DrawerPopupCssVars,
		DrawerPopupDataAttributes,
		drawerSwipeAreaStateAttributesMapping
	} from './attributes.js';
	import { findDrawerProvider } from './context.svelte.js';
	import { useDrawerRootState } from './root.svelte.js';
	import type { DrawerDivProps, DrawerSwipeAreaProps, DrawerSwipeAreaState } from './types.js';

	const DEFAULT_SWIPE_OPEN_RATIO = 0.5;
	const MIN_SWIPE_START_DISTANCE = 1;
	const VELOCITY_THRESHOLD = 0.1;
	const FALLBACK_SWIPE_OPEN_THRESHOLD = 40;

	let {
		disabled: disabledProp,
		swipeDirection: swipeDirectionProp,
		id: idProp,
		render,
		children,
		...elementProps
	}: DrawerSwipeAreaProps = $props();
	const disabled = $derived(disabledProp ?? false);

	const drawer = useDrawerRootState();
	const store = drawer.store;
	const provider = findDrawerProvider();
	const uid = $props.id();
	const id = $derived(idProp ?? `base-ui-${uid}`);
	const attachmentKey = createAttachmentKey();

	let swipeActive = $state(false);
	let swipeArea: HTMLElement | null = null;
	let swipeStartEvent: PointerEvent | TouchEvent | null = null;
	let openedBySwipe = false;
	const dragDelta = { x: 0, y: 0 };
	let closedOffset: number | null = null;
	let swipePopup: HTMLElement | null = null;
	let swipeBackdrop: HTMLElement | null = null;
	let popupTransition: string | null = null;
	let releaseGuardCleanup = () => {};

	const resolvedSwipeDirection: SwipeDirection = $derived(
		swipeDirectionProp ?? opposite(drawer.swipeDirection)
	);
	const dismissDirection = $derived(opposite(resolvedSwipeDirection));
	const horizontal = $derived(dismissDirection === 'left' || dismissDirection === 'right');
	const enabled = $derived(!disabled && (!store.open || swipeActive));

	function disableDismissForSwipe() {
		releaseGuardCleanup();
		store.outsidePressEnabled = false;
	}

	// The pointerup that ends a swipe-open synthesizes a `click`. Released outside the popup, it would
	// dismiss the drawer it just opened. Keep outside presses off until an interaction that is not
	// that click: a deliberate outside press starts with a `pointerdown`, and a keyboard or assistive
	// technology click is virtual. The capture listeners run before the dismiss check, so the press
	// that re-enables still dismisses.
	function enableDismissAfterRelease() {
		releaseGuardCleanup();
		const doc = ownerDocument(swipeArea);
		function restore(event?: Event) {
			if (
				event?.type === 'click' &&
				(event as MouseEvent).detail !== 0 &&
				!isVirtualClick(event as MouseEvent)
			) {
				return;
			}
			releaseGuardCleanup = () => {};
			doc.removeEventListener('pointerdown', restore, true);
			doc.removeEventListener('click', restore, true);
			store.outsidePressEnabled = true;
		}
		releaseGuardCleanup = restore;
		doc.addEventListener('pointerdown', restore, true);
		doc.addEventListener('click', restore, true);
	}

	function getPopupSize(popup: HTMLElement) {
		const size = horizontal ? popup.offsetWidth : popup.offsetHeight;
		return size > 0 ? size : null;
	}

	function resolveClosedOffset(popup: HTMLElement) {
		const size = getPopupSize(popup);
		if (size == null) return null;
		const transform = getElementTransform(ownerWindow(popup).getComputedStyle(popup));
		const offset = horizontal ? transform.x : transform.y;
		if (Number.isFinite(offset) && Math.abs(offset) > 0.5) return Math.min(size, Math.abs(offset));
		return size;
	}

	function resolveSwipeOpenThreshold() {
		const popup = store.popupElement;
		const size = popup ? getPopupSize(popup) : null;
		return size == null ? FALLBACK_SWIPE_OPEN_THRESHOLD : size * DEFAULT_SWIPE_OPEN_RATIO;
	}

	function applySwipeMovement() {
		const popup = store.popupElement;
		if (!popup || !store.open || !store.mounted) return;
		if (closedOffset == null) closedOffset = resolveClosedOffset(popup);
		const offset = closedOffset;
		if (offset === null) return;

		const displacement = Math.max(
			0,
			getDisplacement(resolvedSwipeDirection, dragDelta.x, dragDelta.y)
		);
		const damped = displacement > offset ? offset + Math.sqrt(displacement - offset) : displacement;
		const sign = dismissDirection === 'left' || dismissDirection === 'up' ? -1 : 1;
		const movement = (offset - damped) * sign;
		const openProgress = Math.max(0, Math.min(1, displacement / offset));
		const backdropProgress = Math.max(0, Math.min(1, 1 - openProgress));
		const frontmostHeight = drawer.frontmostHeight;

		popup.style.setProperty(DrawerPopupCssVars.swipeMovementX, `${horizontal ? movement : 0}px`);
		popup.style.setProperty(DrawerPopupCssVars.swipeMovementY, `${horizontal ? 0 : movement}px`);
		popup.setAttribute(DrawerPopupDataAttributes.swiping, '');
		swipePopup = popup;
		if (popupTransition === null) popupTransition = popup.style.transition;
		popup.style.transition = 'none';

		const backdrop = store.backdropElement;
		if (backdrop) {
			backdrop.setAttribute(DrawerPopupDataAttributes.swiping, '');
			swipeBackdrop = backdrop;
			backdrop.style.setProperty(DrawerBackdropCssVars.swipeProgress, `${backdropProgress}`);
			if (openProgress > 0 && frontmostHeight > 0) {
				backdrop.style.setProperty(DrawerPopupCssVars.height, `${frontmostHeight}px`);
			} else {
				backdrop.style.removeProperty(DrawerPopupCssVars.height);
			}
		}

		provider?.setVisualState({
			swipeProgress: openProgress,
			frontmostHeight: openProgress > 0 ? frontmostHeight : 0
		});
		drawer.swipeAreaActive = true;
	}

	function clearSwipeStyles() {
		const popup = swipePopup;
		if (popup) {
			popup.style.removeProperty(DrawerPopupCssVars.swipeMovementX);
			popup.style.removeProperty(DrawerPopupCssVars.swipeMovementY);
			popup.removeAttribute(DrawerPopupDataAttributes.swiping);
			if (popupTransition !== null) popup.style.transition = popupTransition;
		}
		popupTransition = null;
		const backdrop = swipeBackdrop;
		if (backdrop) {
			backdrop.removeAttribute(DrawerPopupDataAttributes.swiping);
			backdrop.style.setProperty(DrawerBackdropCssVars.swipeProgress, '0');
			backdrop.style.removeProperty(DrawerPopupCssVars.height);
		}
		provider?.setVisualState({ swipeProgress: 0, frontmostHeight: 0 });
		swipePopup = null;
		swipeBackdrop = null;
		drawer.swipeAreaActive = false;
	}

	function setDrawerOpen(open: boolean, event?: PointerEvent | TouchEvent) {
		drawer.setOpen(open, createChangeEventDetails(REASONS.swipe, event, swipeArea ?? undefined));
	}

	function resetSwipeInteractionState() {
		swipeStartEvent = null;
		openedBySwipe = false;
		closedOffset = null;
		swipeActive = false;
	}

	function finishSwipeInteraction() {
		resetSwipeInteractionState();
		enableDismissAfterRelease();
		dragDelta.x = 0;
		dragDelta.y = 0;
		clearSwipeStyles();
	}

	const swipe = new SwipeDismiss(() => ({
		enabled,
		directions: [resolvedSwipeDirection],
		element: swipeArea,
		trackDrag: false,
		movementCssVars: { x: DrawerPopupCssVars.swipeMovementX, y: DrawerPopupCssVars.swipeMovementY },
		onSwipeStart(event) {
			disableDismissForSwipe();
			swipeStartEvent = event;
			openedBySwipe = false;
			swipeActive = true;
			dragDelta.x = 0;
			dragDelta.y = 0;
		},
		onProgress(_progress, details) {
			if (!details || !swipeStartEvent) return;
			dragDelta.x = details.deltaX;
			dragDelta.y = details.deltaY;
			if (details.direction !== resolvedSwipeDirection) return;
			const displacement = getDisplacement(resolvedSwipeDirection, details.deltaX, details.deltaY);
			if (!openedBySwipe && displacement < MIN_SWIPE_START_DISTANCE) return;
			if (!openedBySwipe && !store.open) {
				openedBySwipe = true;
				setDrawerOpen(true, swipeStartEvent);
			}
			applySwipeMovement();
		},
		onRelease({ event, direction, deltaX, deltaY, releaseVelocityX, releaseVelocityY }) {
			const displacement = getDisplacement(resolvedSwipeDirection, deltaX, deltaY);
			const velocity = getDisplacement(resolvedSwipeDirection, releaseVelocityX, releaseVelocityY);
			const shouldOpen =
				direction === resolvedSwipeDirection &&
				(displacement >= resolveSwipeOpenThreshold() || velocity >= VELOCITY_THRESHOLD) &&
				!disabled;
			if (shouldOpen) {
				if (!store.open) setDrawerOpen(true, event);
			} else if (openedBySwipe && store.open) {
				setDrawerOpen(false, event);
			}
			finishSwipeInteraction();
			return false;
		},
		onCancel: finishSwipeInteraction
	}));

	// The popup mounts after the gesture opens the drawer. Write the movement once it exists, so it
	// does not paint fully open for a frame.
	$effect(() => {
		void store.popupElement;
		void store.mounted;
		if (untrack(() => swipeActive && drawer.swipeAreaActive)) untrack(applySwipeMovement);
	});

	$effect(() => {
		if (enabled) return;
		untrack(() => {
			if (swipeActive) enableDismissAfterRelease();
			swipe.reset();
			dragDelta.x = 0;
			dragDelta.y = 0;
			clearSwipeStyles();
			resetSwipeInteractionState();
		});
	});

	$effect(() => () => {
		releaseGuardCleanup();
		store.outsidePressEnabled = true;
	});

	const areaState: DrawerSwipeAreaState = $derived({
		open: store.open,
		swiping: swipe.swiping,
		swipeDirection: resolvedSwipeDirection,
		disabled
	});

	function ownSwipeArea(node: HTMLElement) {
		swipeArea = node;
		const detach = registerTrigger(store.triggers, () => id)(node);
		return () => {
			if (swipeArea === node) swipeArea = null;
			if (typeof detach === 'function') detach();
		};
	}

	function skipTouch(handler: (event: PointerEvent) => void) {
		return (event: PointerEvent) => {
			if (event.pointerType !== 'touch') handler(event);
		};
	}

	const hostProps = $derived(
		mergeProps(
			{
				role: 'presentation',
				'aria-hidden': true,
				style: `${enabled ? '' : 'pointer-events: none; '}touch-action: ${horizontal ? 'pan-y' : 'pan-x'}`,
				onpointerdown: skipTouch((event) => {
					swipe.start(event);
					// Keep native text selection and drag from competing with the swipe.
					if (event.cancelable) event.preventDefault();
				}),
				onpointermove: skipTouch(swipe.move),
				onpointerup: skipTouch(swipe.end),
				onpointercancel: skipTouch(swipe.end),
				ontouchstart: swipe.start,
				ontouchmove: swipe.move,
				ontouchend: swipe.end,
				ontouchcancel: swipe.end,
				id,
				...getStateAttributesProps(areaState, drawerSwipeAreaStateAttributesMapping),
				...(render ? { [attachmentKey]: ownSwipeArea } : {})
			},
			elementProps
		) as DrawerDivProps
	);
</script>

{#if render}
	{@render render(hostProps, areaState, children)}
{:else}
	<div {...hostProps} {@attach ownSwipeArea}>{@render children?.()}</div>
{/if}
