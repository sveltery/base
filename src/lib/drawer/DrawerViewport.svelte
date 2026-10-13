<script lang="ts" module>
	import type { SwipeDirection as Direction } from '../internal/useSwipeDismiss.svelte.js';
	import type { ScrollAxis as Axis } from '../internal/scrollable.js';
	import { activeElement as active, contains as within } from '@sveltery/utils';
	import { isElement as isNodeElement } from '@floating-ui/utils/dom';

	function selectionElement(node: Node | null | undefined): Element | null | undefined {
		return isNodeElement(node) ? node : node?.parentElement;
	}

	function setBackdropSwiping(backdrop: HTMLElement | null, swiping: boolean) {
		backdrop?.toggleAttribute('data-swiping', swiping);
	}

	function getBaseSwipeSize(element: HTMLElement, direction: Direction) {
		return direction === 'left' || direction === 'right'
			? element.offsetWidth
			: element.offsetHeight;
	}

	function getBaseSwipeThreshold(element: HTMLElement, direction: Direction) {
		return Math.max(getBaseSwipeSize(element, direction) * 0.5, 10);
	}

	function shouldIgnoreSwipeForTextSelection(doc: Document, root: HTMLElement): boolean {
		const focused = active(doc);
		if (
			focused &&
			within(root, focused) &&
			(focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA')
		) {
			const { selectionStart, selectionEnd } = focused as HTMLInputElement;
			if (selectionStart != null && selectionEnd != null && selectionStart < selectionEnd) {
				return true;
			}
		}
		const selection = doc.getSelection?.();
		if (!selection || selection.isCollapsed) return false;
		return (
			selection.containsNode(root, true) ||
			within(root, selectionElement(selection.anchorNode)) ||
			within(root, selectionElement(selection.focusNode))
		);
	}

	/**
	 * Arbitrates a touchmove between the drawer swipe and a cross-axis gesture: a native scroll, or
	 * an element with the cross-axis swipe-ignore value. `true` leaves the move alone, because the
	 * cross axis won or neither axis has passed the slop yet.
	 */
	function shouldYieldTouchMove(
		state: {
			startX: number;
			startY: number;
			hasCrossAxisGestureTarget: boolean;
			allowSwipe: boolean | null;
			preserveNativeCrossAxisScroll: boolean;
			drawerAxisAttributed: boolean;
		},
		event: TouchEvent,
		touch: Touch,
		vertical: boolean
	): boolean {
		if (state.preserveNativeCrossAxisScroll) return true;
		// Attribution happens once per gesture. The slop is measured from the touch origin, so
		// re-arbitrating mid-drag would freeze the popup.
		if (
			state.drawerAxisAttributed ||
			state.allowSwipe === true ||
			!state.hasCrossAxisGestureTarget
		) {
			return false;
		}
		// A non-cancelable move means the browser already committed to a native scroll.
		if (!event.cancelable) {
			state.preserveNativeCrossAxisScroll = true;
			return true;
		}
		const drawerDelta = Math.abs(
			vertical ? touch.clientY - state.startY : touch.clientX - state.startX
		);
		const crossDelta = Math.abs(
			vertical ? touch.clientX - state.startX : touch.clientY - state.startY
		);
		if (crossDelta >= 6 && crossDelta > drawerDelta + 2) {
			state.preserveNativeCrossAxisScroll = true;
			return true;
		}
		if (drawerDelta >= 6) {
			state.drawerAxisAttributed = true;
			return false;
		}
		// Neither axis passed the slop. On iOS, preventing the first cancelable touchmove cancels
		// native scrolling for the whole gesture, so leave it alone.
		return true;
	}

	function getScrollMetrics(scrollTarget: HTMLElement, axis: Axis) {
		if (axis === 'vertical') {
			return {
				offset: scrollTarget.scrollTop,
				max: Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight)
			};
		}
		return {
			offset: scrollTarget.scrollLeft,
			max: Math.max(0, scrollTarget.scrollWidth - scrollTarget.clientWidth)
		};
	}

	function hasScrollableContentOnAxis(scrollTarget: HTMLElement, axis: Axis) {
		return getScrollMetrics(scrollTarget, axis).max > 0;
	}

	function dismissesFromStartEdge(direction: Direction, axis: Axis) {
		return axis === 'vertical' ? direction === 'down' : direction === 'right';
	}

	function isAtSwipeStartEdge(scrollTarget: HTMLElement, axis: Axis, direction: Direction) {
		const { offset, max } = getScrollMetrics(scrollTarget, axis);
		return dismissesFromStartEdge(direction, axis) ? offset <= 0 : offset >= max;
	}

	function canSwipeFromScrollEdgeOnMove(
		scrollTarget: HTMLElement,
		axis: Axis,
		direction: Direction,
		delta: number
	) {
		const towardDismiss = dismissesFromStartEdge(direction, axis) ? delta > 0 : delta < 0;
		return towardDismiss && isAtSwipeStartEdge(scrollTarget, axis, direction);
	}
</script>

<!--
	A positioning container for the drawer popup that can be made scrollable.
	Renders a `<div>` element. It runs the swipe-to-dismiss gesture and snap point settling.
	Derived from Base UI v1.9.0 packages/react/src/drawer/viewport/DrawerViewport.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
	Touch moves go through one capture listener on the document, so the gesture can be claimed
	before any descendant handler runs.
-->
<script lang="ts">
	import { flushSync, untrack } from 'svelte';
	import { on } from 'svelte/events';
	import { isElement } from '@floating-ui/utils/dom';
	import {
		closest,
		contains,
		createChangeEventDetails,
		getTarget,
		ownerDocument,
		ownerWindow,
		REASONS,
		ScopedAnimationFrame
	} from '@sveltery/utils';
	import { clamp } from '../internal/clamp.js';
	import { getElementAtPoint } from '../internal/getElementAtPoint.js';
	import { mergeProps } from '../internal/mergeProps.js';
	import { findScrollableTouchTarget, type ScrollAxis } from '../internal/scrollable.js';
	import {
		BASE_UI_SWIPE_IGNORE_ATTRIBUTE,
		BASE_UI_SWIPE_IGNORE_SELECTOR
	} from '../internal/swipe-ignore.js';
	import {
		getDisplacement,
		SwipeDismiss,
		type SwipeDirection,
		type SwipeProgressDetails
	} from '../internal/useSwipeDismiss.svelte.js';
	import DialogViewport from '../dialog/DialogViewport.svelte';
	import {
		DRAWER_CONTENT_ATTRIBUTE,
		DrawerBackdropCssVars,
		DrawerPopupCssVars,
		DrawerPopupDataAttributes
	} from './attributes.js';
	import {
		findDrawerProvider,
		findDrawerVirtualKeyboard,
		setDrawerViewport
	} from './context.svelte.js';
	import { useDrawerRootState } from './root.svelte.js';
	import {
		closestSnapPointIndex,
		getSnapPointSwipeMovement,
		type DrawerSnapPoint,
		type ResolvedDrawerSnapPoint
	} from './snap-points.js';
	import type { DrawerViewportProps } from './types.js';

	let { render, children, ...elementProps }: DrawerViewportProps = $props();

	interface TouchScrollState {
		startX: number;
		startY: number;
		lastX: number;
		lastY: number;
		startedInPopup: boolean;
		scrollTarget: HTMLElement | null;
		hasCrossAxisGestureTarget: boolean;
		allowSwipe: boolean | null;
		preserveNativeCrossAxisScroll: boolean;
		drawerAxisAttributed: boolean;
	}

	const MIN_SWIPE_THRESHOLD = 10;
	const FAST_SWIPE_VELOCITY = 0.5;
	const SNAP_VELOCITY_THRESHOLD = 0.5;
	const SNAP_VELOCITY_MULTIPLIER = 300;
	const MAX_SNAP_VELOCITY = 4;
	const MIN_SWIPE_RELEASE_VELOCITY = 0.2;
	const MAX_SWIPE_RELEASE_VELOCITY = 4;
	const MIN_SWIPE_RELEASE_DURATION_MS = 80;
	const MAX_SWIPE_RELEASE_DURATION_MS = 360;
	const MIN_SWIPE_RELEASE_SCALAR = 0.1;
	const MAX_SWIPE_RELEASE_SCALAR = 1;
	const DRAWER_CONTENT_SELECTOR = `[${DRAWER_CONTENT_ATTRIBUTE}]`;
	const AXIS_SWIPE_IGNORE_SELECTORS: Record<ScrollAxis, string> = {
		horizontal: `[${BASE_UI_SWIPE_IGNORE_ATTRIBUTE}="x"]`,
		vertical: `[${BASE_UI_SWIPE_IGNORE_ATTRIBUTE}="y"]`
	};

	const drawer = useDrawerRootState();
	const store = drawer.store;
	const provider = findDrawerProvider();
	const keyboard = findDrawerVirtualKeyboard();
	const controlledDismissFrame = new ScopedAnimationFrame();

	const nestedDrawerOpen = $derived(store.nestedOpenDrawerCount > 0);
	const scrollAxis: ScrollAxis = $derived(
		drawer.swipeDirection === 'left' || drawer.swipeDirection === 'right'
			? 'horizontal'
			: 'vertical'
	);
	const crossScrollAxis: ScrollAxis = $derived(
		scrollAxis === 'vertical' ? 'horizontal' : 'vertical'
	);
	const swipeDirections: SwipeDirection[] = $derived.by(() => {
		const direction = drawer.swipeDirection;
		if (drawer.hasSnapPoints && (direction === 'down' || direction === 'up')) {
			return direction === 'down' ? ['down', 'up'] : ['up', 'down'];
		}
		return [direction];
	});

	let swipeRelease = $state<number | null>(null);
	let pendingSwipeCloseSnapPoint: DrawerSnapPoint | null | undefined = undefined;
	let swipingNow = false;
	let swipingBackdrop: HTMLElement | null = null;
	let nestedSwipeActive = false;
	let lastPointerType = '';
	let ignoreNextTouchStartFromPen = false;
	let ignoreTouchSwipe = false;
	let touchState: TouchScrollState | null = null;

	function setSwipeDismissed(dismissed: boolean) {
		store.popupElement?.toggleAttribute(DrawerPopupDataAttributes.swipeDismiss, dismissed);
		store.backdropElement?.toggleAttribute(DrawerPopupDataAttributes.swipeDismiss, dismissed);
	}

	function clearSwipeRelease() {
		setSwipeDismissed(false);
		store.popupElement?.removeAttribute(DrawerPopupDataAttributes.endingStyle);
		swipeRelease = null;
	}

	function finishNestedSwipe() {
		if (!nestedSwipeActive) return;
		nestedSwipeActive = false;
		drawer.parent?.onNestedSwipingChange(false);
	}

	function applySwipeProgress(progress: number, notifyParent: boolean) {
		const active = store.open && !store.nested;
		const swipeProgress = active ? progress : 0;
		const nestedProgress = store.open ? progress : 0;
		const parent = drawer.parent;
		const frontmostHeight = drawer.frontmostHeight;

		if (notifyParent && parent) {
			parent.onNestedSwipeProgressChange(nestedProgress);
			if (nestedProgress <= 0) finishNestedSwipe();
		}

		provider?.setVisualState({
			swipeProgress,
			frontmostHeight: swipeProgress > 0 ? frontmostHeight : 0
		});

		const backdrop = store.backdropElement;
		if (!backdrop) return;
		const showProgress = active && swipeProgress > 0;
		backdrop.style.setProperty(
			DrawerBackdropCssVars.swipeProgress,
			showProgress ? `${swipeProgress}` : '0'
		);
		if (showProgress && frontmostHeight > 0) {
			backdrop.style.setProperty(DrawerPopupCssVars.height, `${frontmostHeight}px`);
		} else {
			backdrop.style.removeProperty(DrawerPopupCssVars.height);
		}
	}

	function resolveSwipeRelease(
		popup: HTMLElement,
		direction: SwipeDirection,
		deltaX: number,
		deltaY: number,
		velocityX: number,
		velocityY: number,
		releaseVelocityX: number,
		releaseVelocityY: number
	): number | null {
		const size = getBaseSwipeSize(popup, direction);
		if (size <= 0) return null;

		// The snap point offset shifts the popup along the dismiss direction for both `down` and
		// `up`, so it always adds to the directional translation.
		const snapPointBaseOffset =
			(direction === 'down' || direction === 'up') && drawer.hasSnapPoints
				? (drawer.activeSnapPointOffset ?? 0)
				: 0;
		const remaining = Math.max(
			0,
			size - (snapPointBaseOffset + getDisplacement(direction, deltaX, deltaY))
		);
		if (remaining <= 0) return null;

		const releaseVelocity = getDisplacement(direction, releaseVelocityX, releaseVelocityY);
		const velocity =
			Math.abs(releaseVelocity) > 0
				? releaseVelocity
				: getDisplacement(direction, velocityX, velocityY);
		if (velocity <= MIN_SWIPE_RELEASE_VELOCITY) return null;

		const clampedVelocity = clamp(velocity, MIN_SWIPE_RELEASE_VELOCITY, MAX_SWIPE_RELEASE_VELOCITY);
		const duration = clamp(
			remaining / clampedVelocity,
			MIN_SWIPE_RELEASE_DURATION_MS,
			MAX_SWIPE_RELEASE_DURATION_MS
		);
		const normalized =
			(duration - MIN_SWIPE_RELEASE_DURATION_MS) /
			(MAX_SWIPE_RELEASE_DURATION_MS - MIN_SWIPE_RELEASE_DURATION_MS);
		return (
			MIN_SWIPE_RELEASE_SCALAR + normalized * (MAX_SWIPE_RELEASE_SCALAR - MIN_SWIPE_RELEASE_SCALAR)
		);
	}

	function updateNestedSwipeActive(details: SwipeProgressDetails | undefined) {
		if (nestedSwipeActive || !details) return;
		const direction = details.direction ?? drawer.swipeDirection;
		if (
			Math.abs(getDisplacement(direction, details.deltaX, details.deltaY)) < MIN_SWIPE_THRESHOLD
		) {
			return;
		}
		nestedSwipeActive = true;
		drawer.parent?.onNestedSwipingChange(true);
	}

	const swipe = new SwipeDismiss(() => ({
		enabled: store.mounted && !nestedDrawerOpen,
		directions: swipeDirections,
		element: store.popupElement,
		ignoreSelectorWhenTouch: false,
		ignoreScrollableAncestors: true,
		movementCssVars: { x: DrawerPopupCssVars.swipeMovementX, y: DrawerPopupCssVars.swipeMovementY },
		onSwipeStart(event) {
			if ('touches' in event || event.pointerType === 'touch') return;
			const popup = store.popupElement;
			const selection = ownerDocument(popup).getSelection?.();
			if (!selection || selection.isCollapsed) return;
			const anchor = selectionElement(selection.anchorNode);
			const focus = selectionElement(selection.focusNode);
			if (!contains(popup, anchor) && !contains(popup, focus)) return;
			selection.removeAllRanges();
		},
		onSwipingChange(swiping) {
			swipingNow = swiping;
			swipingBackdrop = store.backdropElement;
			setBackdropSwiping(swipingBackdrop, swiping);
			if (!swiping && !drawer.parent) finishNestedSwipe();
		},
		swipeThreshold: ({ element, direction }) => getBaseSwipeThreshold(element, direction),
		canStart(position, details) {
			const popup = store.popupElement;
			if (!popup) return false;
			const event = details.nativeEvent;
			const touchLike = 'touches' in event || event.pointerType === 'touch';
			const state = touchLike ? touchState : null;

			const elementAtPoint = getElementAtPoint(popup.getRootNode(), position.x, position.y);
			// A touch that started inside can activate after it leaves the popup.
			if (!state?.startedInPopup && !contains(popup, elementAtPoint)) return false;
			if (touchLike && shouldIgnoreSwipeForTextSelection(popup.ownerDocument, popup)) return false;

			// Over a cross-axis gesture target, wait until the drawer axis wins the gesture. Starting now
			// would leave the drawer swiping while the cross-axis target handles the drag.
			if (
				state?.hasCrossAxisGestureTarget &&
				!state.drawerAxisAttributed &&
				state.allowSwipe !== true
			) {
				return false;
			}
			return true;
		},
		onProgress(progress, details) {
			const swiping = swipingNow;
			if (swiping) updateNestedSwipeActive(details);

			const offset = drawer.activeSnapPointOffset;
			if (swiping && drawer.swipeDirection === 'down' && drawer.hasSnapPoints && details) {
				const popup = store.popupElement;
				if (popup) {
					popup.style.removeProperty('transform');
					popup.style.setProperty(
						DrawerPopupCssVars.swipeMovementY,
						`${getSnapPointSwipeMovement(offset ?? 0, details.deltaY)}px`
					);
				}
			}

			let resolved = progress;
			const range = drawer.snapPointRange;
			const popupHeight = drawer.popupHeight;
			if (range && popupHeight > 0) {
				const base = offset ?? range.minOffset;
				// Outside a drag the hook still reports the last deltas, after a release and for a gesture
				// that never started. Using them would put drag progress back on a resting drawer.
				if (swiping && details && Number.isFinite(details.deltaY)) {
					resolved = clamp(
						(clamp(base + details.deltaY, 0, popupHeight) - range.minOffset) / range.range,
						0,
						1
					);
				} else if (drawer.snapPointProgress !== null) {
					resolved = drawer.snapPointProgress;
				}
			}

			// A parent drawer follows an active drag only.
			if (!swiping) {
				drawer.parent?.onNestedSwipeProgressChange(0);
				finishNestedSwipe();
			}

			applySwipeProgress(resolved, swiping);
		},
		onRelease({
			event,
			deltaX,
			deltaY,
			direction,
			velocityX,
			velocityY,
			releaseVelocityX,
			releaseVelocityY
		}) {
			const popup = store.popupElement;
			if (!popup) {
				clearSwipeRelease();
				return undefined;
			}
			const releasePopup = popup;

			function startSwipeRelease(resolvedDirection: SwipeDirection) {
				// Start the ending styles now, so the popup does not look stuck on release.
				finishNestedSwipe();
				setSwipeDismissed(true);
				releasePopup.style.removeProperty('transition');
				releasePopup.setAttribute(DrawerPopupDataAttributes.endingStyle, '');
				flushSync(() => {
					swipeRelease = resolveSwipeRelease(
						releasePopup,
						resolvedDirection,
						deltaX,
						deltaY,
						velocityX,
						velocityY,
						releaseVelocityX,
						releaseVelocityY
					);
				});
			}

			if (!drawer.hasSnapPoints) {
				if (!direction) {
					clearSwipeRelease();
					return undefined;
				}
				const directionalDelta = getDisplacement(direction, deltaX, deltaY);
				if (directionalDelta <= 0) {
					clearSwipeRelease();
					return false;
				}
				if (getDisplacement(direction, velocityX, velocityY) >= FAST_SWIPE_VELOCITY) {
					startSwipeRelease(direction);
					return true;
				}
				const shouldClose = directionalDelta > getBaseSwipeThreshold(releasePopup, direction);
				if (shouldClose) startSwipeRelease(direction);
				else clearSwipeRelease();
				return shouldClose;
			}

			const swipeDirection = drawer.swipeDirection;
			if (swipeDirection !== 'down' && swipeDirection !== 'up') {
				clearSwipeRelease();
				return undefined;
			}
			const popupHeight = drawer.popupHeight;
			if (!popupHeight) {
				clearSwipeRelease();
				return false;
			}
			const resolvedSnapPoints = drawer.resolvedSnapPoints;
			if (resolvedSnapPoints.length === 0) {
				clearSwipeRelease();
				return undefined;
			}

			const dragDelta = swipeDirection === 'down' ? deltaY : -deltaY;
			const dragDirection = Math.sign(dragDelta);
			const fallbackVelocity = swipeDirection === 'down' ? velocityY : -velocityY;
			let directionalVelocity = swipeDirection === 'down' ? releaseVelocityY : -releaseVelocityY;
			if (dragDirection !== 0 && Math.abs(dragDelta) >= MIN_SWIPE_THRESHOLD) {
				const velocityDirection = Math.sign(directionalVelocity);
				// A touch reversal must not flip the snap decision.
				if (velocityDirection !== 0 && velocityDirection !== dragDirection) {
					directionalVelocity = fallbackVelocity;
				}
			}

			const currentOffset = drawer.activeSnapPointOffset ?? 0;
			const dragTargetOffset = clamp(currentOffset + dragDelta, 0, popupHeight);
			const velocityOffset =
				Math.abs(directionalVelocity) >= SNAP_VELOCITY_THRESHOLD
					? clamp(directionalVelocity, -MAX_SNAP_VELOCITY, MAX_SNAP_VELOCITY) *
						SNAP_VELOCITY_MULTIPLIER
					: 0;
			const targetOffset = drawer.snapToSequentialPoints
				? dragTargetOffset
				: clamp(dragTargetOffset + velocityOffset, 0, popupHeight);
			const snapDetails = createChangeEventDetails(REASONS.swipe, event);

			const settleInPlace = () => {
				// The hook's trailing progress update is skipped when the drag made no dismissal
				// progress, so reset the nested swipe state here.
				applySwipeProgress(0, true);
				clearSwipeRelease();
				return false;
			};

			const settleOnSnapPoint = (snapPoint: ResolvedDrawerSnapPoint) => {
				drawer.setActiveSnapPoint(snapPoint.value, snapDetails);
				return settleInPlace();
			};

			const closeFromSnapPoints = (fallback: ResolvedDrawerSnapPoint) => {
				// A gesture never attributed to an axis may settle but not dismiss: the hook drops a
				// directionless dismissal, which would leave the popup closed-looking while open.
				if (!direction) return settleOnSnapPoint(fallback);
				const previous = untrack(() => drawer.activeSnapPoint);
				drawer.setActiveSnapPoint(null, snapDetails);
				// A canceled `null` snap point rejects the dismissal before exit styles start.
				if (snapDetails.isCanceled) return settleInPlace();
				pendingSwipeCloseSnapPoint = previous;
				startSwipeRelease(swipeDirection);
				return true;
			};

			if (drawer.snapToSequentialPoints) {
				const ordered = [...resolvedSnapPoints].sort(
					(first, second) => first.offset - second.offset
				);
				const offsets = ordered.map((point) => point.offset);
				const currentIndex = closestSnapPointIndex(offsets, currentOffset);
				let target = ordered[closestSnapPointIndex(offsets, targetOffset)];
				const velocityDirection = Math.sign(directionalVelocity);
				const shouldAdvance =
					dragDirection !== 0 &&
					velocityDirection !== 0 &&
					velocityDirection === dragDirection &&
					Math.abs(directionalVelocity) >= SNAP_VELOCITY_THRESHOLD;
				let effectiveTargetOffset = targetOffset;

				if (shouldAdvance) {
					const adjacentIndex = clamp(currentIndex + dragDirection, 0, ordered.length - 1);
					if (adjacentIndex !== currentIndex) {
						const adjacent = ordered[adjacentIndex];
						const forceAdjacent =
							dragDirection > 0 ? targetOffset < adjacent.offset : targetOffset > adjacent.offset;
						if (forceAdjacent) {
							target = adjacent;
							effectiveTargetOffset = adjacent.offset;
						}
					} else if (dragDirection > 0) {
						return closeFromSnapPoints(target);
					}
				}

				const closeDistance = Math.abs(effectiveTargetOffset - popupHeight);
				const snapDistance = Math.abs(effectiveTargetOffset - target.offset);
				if (closeDistance < snapDistance) return closeFromSnapPoints(target);
				return settleOnSnapPoint(target);
			}

			const closestSnapPoint =
				resolvedSnapPoints[
					closestSnapPointIndex(
						resolvedSnapPoints.map((point) => point.offset),
						targetOffset
					)
				];
			if (directionalVelocity >= FAST_SWIPE_VELOCITY && dragDelta > 0) {
				return closeFromSnapPoints(closestSnapPoint);
			}
			if (Math.abs(targetOffset - popupHeight) < Math.abs(targetOffset - closestSnapPoint.offset)) {
				return closeFromSnapPoints(closestSnapPoint);
			}
			return settleOnSnapPoint(closestSnapPoint);
		},
		onDismiss(event) {
			provider?.setVisualState({ swipeProgress: 0, frontmostHeight: 0 });
			const backdrop = store.backdropElement;
			if (backdrop) {
				backdrop.style.setProperty(DrawerBackdropCssVars.swipeProgress, '0');
				backdrop.style.removeProperty(DrawerPopupCssVars.height);
			}

			const details = createChangeEventDetails(REASONS.swipe, event);
			drawer.setOpen(false, details);

			if (details.isCanceled) {
				restorePendingSnapPoint(event);
				swipe.reset();
				clearSwipeRelease();
				return;
			}

			// A parent that keeps `open` true declined the close. Its write lands before the next
			// frame, so check then and undo the dismissal if the drawer is still open.
			if (store.open) {
				controlledDismissFrame.request(() => {
					if (store.open) {
						restorePendingSnapPoint(event);
						clearSwipeRelease();
						swipe.reset();
					} else {
						pendingSwipeCloseSnapPoint = undefined;
					}
				});
				return;
			}

			pendingSwipeCloseSnapPoint = undefined;
			setSwipeDismissed(true);
		}
	}));

	function restorePendingSnapPoint(event: Event) {
		const pending = pendingSwipeCloseSnapPoint;
		if (pending !== undefined) {
			drawer.setActiveSnapPoint(pending, createChangeEventDetails(REASONS.swipe, event));
		}
		pendingSwipeCloseSnapPoint = undefined;
	}

	// A non-passive document listener makes all touch scrolling wait on the main thread, so it is
	// attached only while the drawer is open.
	$effect(() => {
		const root = store.viewportElement ?? store.popupElement;
		if (!root || !store.open || !store.mounted) return;
		const doc = ownerDocument(root);
		const vertical = scrollAxis === 'vertical';
		const axis = scrollAxis;
		const direction = drawer.swipeDirection;
		const blocked = nestedDrawerOpen;

		function processTouchMove(event: TouchEvent, state: TouchScrollState, touch: Touch) {
			const drawerAxisDelta = vertical ? touch.clientY - state.lastY : touch.clientX - state.lastX;
			// Leave pinch zoom and iOS selection handles to the browser.
			if (event.touches.length === 2) return;
			if (shouldIgnoreSwipeForTextSelection(doc, root!) || blocked) return;
			if (shouldYieldTouchMove(state, event, touch, vertical)) return;

			const scrollTarget = state.scrollTarget;
			if (!scrollTarget || scrollTarget === doc.documentElement || scrollTarget === doc.body) {
				if (event.cancelable) event.preventDefault();
				// Claim the gesture before descendant touch handlers see it.
				event.stopPropagation();
				swipe.move(event, root!);
				return;
			}

			if (!hasScrollableContentOnAxis(scrollTarget, axis)) {
				// The container does not overflow on the drawer axis, so keep the page from scrolling.
				if (event.cancelable) event.preventDefault();
				event.stopPropagation();
				return;
			}

			if (drawerAxisDelta !== 0) {
				const fromEdge = canSwipeFromScrollEdgeOnMove(
					scrollTarget,
					axis,
					direction,
					drawerAxisDelta
				);
				if (!state.allowSwipe) {
					if (event.cancelable && fromEdge) {
						state.allowSwipe = true;
						event.preventDefault();
					} else {
						state.allowSwipe = false;
					}
				} else if (event.cancelable) {
					event.preventDefault();
				}
			}

			if (state.allowSwipe === true) {
				event.stopPropagation();
				swipe.move(event, root!);
			}
		}

		function handleTouchMove(event: TouchEvent) {
			// The keyboard provider tells a tap from a drag, even when the swipe claims the move.
			keyboard?.onTouchMove(event);
			if (ignoreTouchSwipe) return;
			const state = touchState;
			const touch = event.touches[0];
			if (!touch || !state) return;
			processTouchMove(event, state, touch);
			state.lastX = touch.clientX;
			state.lastY = touch.clientY;
		}

		return on(doc, 'touchmove', handleTouchMove, { passive: false, capture: true });
	});

	$effect(() => {
		if (!drawer.snapPointRange || swipe.swiping) return;
		void store.backdropElement;
		void drawer.frontmostHeight;
		const progress = !store.open || store.nested ? 0 : (drawer.snapPointProgress ?? 0);
		untrack(() => applySwipeProgress(progress, false));
	});

	$effect(() => {
		const parent = drawer.parent;
		if (!parent) return;
		if (!store.open) untrack(() => parent.onNestedSwipeProgressChange(0));
		return () => parent.onNestedSwipeProgressChange(0);
	});

	$effect(() => {
		if (!store.open) return;
		untrack(() => {
			// The swipe area writes the popup's movement while it opens the drawer. Resetting here would
			// zero it and flash the popup fully open for a frame.
			if (!drawer.swipeAreaActive) swipe.reset();
			clearSwipeRelease();
		});
	});

	$effect(() => () => {
		provider?.setVisualState({ swipeProgress: 0, frontmostHeight: 0 });
		setBackdropSwiping(swipingBackdrop, false);
		setBackdropSwiping(store.backdropElement, false);
		finishNestedSwipe();
	});

	setDrawerViewport({
		get swiping() {
			return swipe.swiping;
		},
		getDragStyles: swipe.getDragStyles,
		get swipeStrength() {
			return swipeRelease;
		}
	});

	function resetTouchSwipeState(ignoreSwipe: boolean) {
		ignoreTouchSwipe = ignoreSwipe;
		touchState = null;
	}

	function resetTouchTrackingState() {
		resetTouchSwipeState(false);
		lastPointerType = '';
		ignoreNextTouchStartFromPen = false;
	}

	const viewportProps = $derived(
		mergeProps(elementProps, {
			onpointerdown(event: PointerEvent & { currentTarget: HTMLElement }) {
				lastPointerType = event.pointerType;
				ignoreNextTouchStartFromPen = event.pointerType === 'pen';
				if (!store.open || !store.mounted || nestedDrawerOpen) return;
				const elementAtPoint = getElementAtPoint(
					event.currentTarget.getRootNode(),
					event.clientX,
					event.clientY
				);
				// Pointer drags capture on press and cannot wait to see the gesture's axis, so any
				// swipe-ignore value ignores them.
				if (
					closest(elementAtPoint, BASE_UI_SWIPE_IGNORE_SELECTOR) ||
					closest(elementAtPoint, DRAWER_CONTENT_SELECTOR)
				) {
					return;
				}
				if (event.pointerType === 'touch') return;
				swipe.start(event);
			},
			onpointermove(event: PointerEvent) {
				if (event.pointerType === 'touch') return;
				swipe.move(event);
			},
			onpointerup(event: PointerEvent) {
				lastPointerType = '';
				if (event.pointerType !== 'touch') swipe.end(event);
			},
			onpointercancel(event: PointerEvent) {
				lastPointerType = '';
				if (event.pointerType !== 'touch') swipe.end(event);
			},
			ontouchstart(event: TouchEvent & { currentTarget: HTMLElement }) {
				if (lastPointerType === 'pen' && ignoreNextTouchStartFromPen) {
					ignoreNextTouchStartFromPen = false;
					resetTouchSwipeState(false);
					return;
				}
				if (!store.open || !store.mounted || nestedDrawerOpen) {
					resetTouchSwipeState(false);
					return;
				}
				const touch = event.touches[0];
				if (!touch) return;
				const root = event.currentTarget;
				const win = ownerWindow(root);
				if (
					event
						.composedPath()
						.some((target) => target instanceof win.HTMLInputElement && target.type === 'range')
				) {
					resetTouchSwipeState(false);
					return;
				}

				const elementAtPoint = getElementAtPoint(root.getRootNode(), touch.clientX, touch.clientY);
				const eventTarget = getTarget(event);
				const target = isElement(eventTarget) ? eventTarget : root;
				if (!contains(root, target)) {
					resetTouchSwipeState(true);
					return;
				}

				keyboard?.onTouchStart(event);

				// `x` or `y` hands touch drags on that axis to the element. Any other value ignores the
				// swipe. A cross-axis element is arbitrated like a native cross-axis scroller.
				if (
					closest(
						elementAtPoint,
						`${BASE_UI_SWIPE_IGNORE_SELECTOR}:not(${AXIS_SWIPE_IGNORE_SELECTORS[crossScrollAxis]})`
					)
				) {
					resetTouchSwipeState(true);
					return;
				}
				ignoreTouchSwipe = false;

				const scrollTarget = findScrollableTouchTarget(target, root, scrollAxis);
				const hasCrossAxisGestureTarget =
					findScrollableTouchTarget(target, root, crossScrollAxis) != null ||
					closest(elementAtPoint, AXIS_SWIPE_IGNORE_SELECTORS[crossScrollAxis]) != null;

				let allowSwipe: boolean | null = null;
				if (scrollTarget) {
					allowSwipe = isAtSwipeStartEdge(scrollTarget, scrollAxis, drawer.swipeDirection)
						? null
						: false;
				}

				touchState = {
					startX: touch.clientX,
					startY: touch.clientY,
					lastX: touch.clientX,
					lastY: touch.clientY,
					startedInPopup: contains(store.popupElement, elementAtPoint),
					scrollTarget,
					hasCrossAxisGestureTarget,
					allowSwipe,
					preserveNativeCrossAxisScroll: false,
					drawerAxisAttributed: false
				};
				swipe.start(event);
			},
			ontouchend(event: TouchEvent) {
				keyboard?.onTouchEnd(event);
				resetTouchTrackingState();
				swipe.end(event);
			},
			ontouchcancel(event: TouchEvent) {
				keyboard?.onTouchCancel();
				resetTouchTrackingState();
				swipe.end(event);
			},
			// Drawers mark nesting with their own attributes.
			'data-nested-dialog-open': undefined
		})
	);
</script>

<DialogViewport {...viewportProps} {render}>{@render children?.()}</DialogViewport>
