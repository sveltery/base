<!--
	Keyboard-aware focus and scroll handling for bottom-sheet drawers with form fields.
	Doesn't render its own HTML element. It needs a Drawer.Viewport, which receives the
	`--drawer-keyboard-inset` variable.
	Derived from Base UI v1.9.0
	packages/react/src/drawer/virtual-keyboard-provider/DrawerVirtualKeyboardProvider.tsx
	(commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
-->
<script lang="ts" module>
	interface KeyboardTouchTarget {
		readonly focusTarget: HTMLElement;
		readonly clickTarget: HTMLElement;
	}

	const INPUT_TAP_HIT_SLOP = 16;
	const KEYBOARD_INPUT_TYPES = new Set([
		'email',
		'number',
		'password',
		'search',
		'tel',
		'text',
		'url'
	]);

	// The lift point landed on another interactive element or label. The caller must not fall back
	// to the touchstart target, because `touchend.target` stays the touchstart node on mobile.
	const KEYBOARD_TAP_BLOCKED = Symbol('KeyboardTapBlocked');

	function isKeyboardInputElement(element: HTMLElement): boolean {
		if (element.isContentEditable) return true;
		const win = ownerWindow(element);
		if (
			element instanceof win.HTMLTextAreaElement ||
			(element instanceof win.HTMLInputElement && KEYBOARD_INPUT_TYPES.has(element.type))
		) {
			// A disabled control cannot focus, so tap-to-focus must not fire its click.
			return !element.matches(':disabled');
		}
		return false;
	}

	function resolveKeyboardInputTarget(target: EventTarget | null): HTMLElement | null {
		if (!isHTMLElement(target)) return null;
		if (isKeyboardInputElement(target)) {
			return target.isContentEditable ? getContentEditableHost(target) : target;
		}
		const label = closest(target, 'label') as HTMLLabelElement | null;
		const control = label?.control ?? null;
		return isHTMLElement(control) && isKeyboardInputElement(control) ? control : null;
	}

	function resolveKeyboardTouchTarget(target: EventTarget | null): KeyboardTouchTarget | null {
		if (!isHTMLElement(target)) return null;
		const focusTarget = resolveKeyboardInputTarget(target);
		return focusTarget ? { focusTarget, clickTarget: target } : null;
	}

	// Inherited-editable descendants are not focusable, so resolve taps on them to the editing host.
	function getContentEditableHost(element: HTMLElement): HTMLElement {
		let host = element;
		while (host.parentElement?.isContentEditable) host = host.parentElement;
		return host;
	}

	function resolveKeyboardTouchTargetFromPoint(
		root: Node,
		clientX: number,
		clientY: number
	): KeyboardTouchTarget | typeof KEYBOARD_TAP_BLOCKED | null {
		const exact = getElementAtPoint(root, clientX, clientY);
		if (isHTMLElement(exact)) {
			const focusTarget = resolveKeyboardInputTarget(exact);
			if (focusTarget) return { focusTarget, clickTarget: exact };
		}

		// Probing nearby points makes up for iOS retargeting taps while the page reacts to the
		// keyboard, but must not steal a tap on another interactive element or a label.
		if (isInteractiveElement(exact) || closest(exact, 'label') != null) return KEYBOARD_TAP_BLOCKED;

		for (const [offsetX, offsetY] of [
			[0, INPUT_TAP_HIT_SLOP],
			[0, -INPUT_TAP_HIT_SLOP],
			[INPUT_TAP_HIT_SLOP, 0],
			[-INPUT_TAP_HIT_SLOP, 0]
		]) {
			const focusTarget = resolveKeyboardInputTarget(
				getElementAtPoint(root, clientX + offsetX, clientY + offsetY)
			);
			if (focusTarget) return { focusTarget, clickTarget: focusTarget };
		}
		return null;
	}

	function dispatchKeyboardClick(target: HTMLElement, touch: Pick<Touch, 'clientX' | 'clientY'>) {
		const win = ownerWindow(target);
		const ClickEvent = win.PointerEvent ?? win.MouseEvent;
		target.dispatchEvent(
			new ClickEvent('click', {
				bubbles: true,
				cancelable: true,
				clientX: touch.clientX,
				clientY: touch.clientY,
				detail: 1,
				view: win
			})
		);
	}

	function focusKeyboardInputWithoutPageScroll(target: HTMLElement) {
		const wasFocused = activeElement(ownerDocument(target)) === target;
		// iOS Safari can scroll the page for transformed sheets even with preventScroll. Move the
		// input off-screen for the synchronous focus call only.
		const restore = overrideGeometryDuringFocus(target, -2000);
		try {
			if (wasFocused) target.blur();
			target.focus({ preventScroll: true });
		} finally {
			restore();
		}
	}

	// Overrides the painted geometry WebKit samples on focus. The rect is hidden, not detached, so
	// layout does not change. The caller restores it before the next paint.
	function overrideGeometryDuringFocus(target: HTMLElement, translateY: number): () => void {
		const { opacity, transform, transition } = target.style;
		target.style.transition = 'none';
		target.style.opacity = '0';
		target.style.transform = `translateY(${translateY}px)`;
		return () => {
			target.style.opacity = opacity;
			target.style.transform = transform;
			target.style.transition = transition;
		};
	}

	// Start at the parent: scrolling a textarea's own content never moves its box out from under the
	// keyboard. Prefer a scrolling ancestor, then one that scrolls only once the slack is added.
	function findKeyboardScrollTarget(target: HTMLElement, root: HTMLElement): HTMLElement | null {
		const start = getParentNode(target);
		return (
			findScrollableTouchTarget(start, root, 'vertical') ??
			findScrollableTouchTarget(start, root, 'vertical', true)
		);
	}
</script>

<script lang="ts">
	import { getParentNode, isHTMLElement } from '@floating-ui/utils/dom';
	import {
		activeElement,
		closest,
		contains,
		getTarget,
		ownerDocument,
		ownerWindow,
		ScopedAnimationFrame,
		ScopedTimeout
	} from '@sveltery/utils';
	import { on } from 'svelte/events';
	import { isInteractiveElement } from '@sveltery/floating-ui-svelte';
	import { clamp } from '../internal/clamp.js';
	import { getElementAtPoint } from '../internal/getElementAtPoint.js';
	import { findScrollableTouchTarget } from '../internal/scrollable.js';
	import { useDrawerRootState } from './root.svelte.js';
	import { DrawerViewportCssVars } from './attributes.js';
	import { setDrawerVirtualKeyboard } from './context.svelte.js';
	import type { DrawerVirtualKeyboardProviderProps } from './types.js';

	let { children }: DrawerVirtualKeyboardProviderProps = $props();

	interface ScrollAdjustment {
		readonly element: HTMLElement;
		readonly overflowAnchor: string;
		readonly paddingBottom: string;
		readonly scrollPaddingBottom: string;
		readonly computedPaddingBottom: number;
		readonly computedScrollPaddingBottom: number;
	}

	interface KeyboardVisualViewport {
		readonly top: number;
		readonly bottom: number;
		/** The browser is still resizing the layout viewport to the visual viewport. */
		readonly resizing: boolean;
	}

	const KEYBOARD_RESIZE_THRESHOLD = 60;
	const KEYBOARD_VISIBILITY_MARGIN = 16;
	// Long enough for a smooth scroll to show progress between passes, short enough to recover from
	// a scroll WebKit's reveal canceled. The passes cover a focus-driven CSS transition, such as a
	// 260ms footer resize.
	const KEYBOARD_REALIGN_INTERVAL = 150;
	const KEYBOARD_REALIGN_MAX_PASSES = 4;
	// Frames the alignment waits for the destination to stop moving before scrolling anyway.
	const KEYBOARD_SETTLE_FRAME_LIMIT = 60;
	const INPUT_TAP_MOVE_THRESHOLD = 10;

	const store = useDrawerRootState().store;
	const keyboardFocusFrame = new ScopedAnimationFrame();
	const keyboardRealignTimeout = new ScopedTimeout();

	// The viewport is the measurement root and hosts the inset. Drawer.Popup already warns when it
	// is missing.
	const rootElement = $derived(store.viewportElement);
	const nestedDrawerOpen = $derived(store.nestedOpenDialogCount > 0);

	let pendingKeyboardFocusMoved = false;
	let keyboardTouchStart: { x: number; y: number } | null = null;
	let focusedKeyboardTarget: HTMLElement | null = null;
	let keyboardScrollAdjustment: ScrollAdjustment | null = null;
	let programmaticKeyboardFocus = false;
	let getKeyboardViewport: (() => KeyboardVisualViewport | null) | null = null;

	function restoreKeyboardScrollAdjustment() {
		const adjustment = keyboardScrollAdjustment;
		if (!adjustment) return;
		adjustment.element.style.overflowAnchor = adjustment.overflowAnchor;
		adjustment.element.style.paddingBottom = adjustment.paddingBottom;
		adjustment.element.style.scrollPaddingBottom = adjustment.scrollPaddingBottom;
		keyboardScrollAdjustment = null;
	}

	function setKeyboardScrollSlack(element: HTMLElement, slack: number) {
		const rounded = Math.max(0, Math.ceil(slack));
		let adjustment = keyboardScrollAdjustment;
		if (adjustment && !adjustment.element.isConnected) {
			restoreKeyboardScrollAdjustment();
			adjustment = null;
		}
		if (rounded === 0) {
			restoreKeyboardScrollAdjustment();
			return;
		}
		if (adjustment && adjustment.element !== element) {
			restoreKeyboardScrollAdjustment();
			adjustment = null;
		}
		if (!adjustment) {
			const styles = ownerWindow(element).getComputedStyle(element);
			adjustment = {
				element,
				overflowAnchor: element.style.overflowAnchor,
				paddingBottom: element.style.paddingBottom,
				scrollPaddingBottom: element.style.scrollPaddingBottom,
				computedPaddingBottom: Number.parseFloat(styles.paddingBottom) || 0,
				computedScrollPaddingBottom: Number.parseFloat(styles.scrollPaddingBottom) || 0
			};
			keyboardScrollAdjustment = adjustment;
		}
		element.style.overflowAnchor = 'none';
		// At least the visibility margin sits below the content, so the last field never ends flush
		// against the keyboard.
		element.style.paddingBottom = `${
			rounded + Math.max(adjustment.computedPaddingBottom, KEYBOARD_VISIBILITY_MARGIN)
		}px`;
		element.style.scrollPaddingBottom = `${
			adjustment.computedScrollPaddingBottom + KEYBOARD_VISIBILITY_MARGIN
		}px`;
	}

	function animateKeyboardScroll(element: HTMLElement, scrollTop: number) {
		const reduced = ownerWindow(element).matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
		element.scrollTo({ top: scrollTop, behavior: reduced ? 'auto' : 'smooth' });
	}

	function resetTouchTrackingState() {
		pendingKeyboardFocusMoved = false;
		keyboardTouchStart = null;
	}

	$effect(() => {
		const open = store.open;
		const mounted = store.mounted;
		const root = rootElement;
		const modal = store.modal;
		const nested = nestedDrawerOpen;

		if (!mounted || !open) {
			focusedKeyboardTarget = null;
			restoreKeyboardScrollAdjustment();
			keyboardFocusFrame.cancel();
			return;
		}
		if (!root) {
			restoreKeyboardScrollAdjustment();
			return;
		}

		const doc = ownerDocument(root);
		const win = ownerWindow(root);
		const visualViewport = win.visualViewport;

		// Alignment bookkeeping: destination stability, whether a scroll was issued, and the last
		// observed progress, so delayed passes can tell a moving scroll from a stalled one.
		let scrollElement: HTMLElement | null = null;
		let scrollDestination = 0;
		let scrollChecks = 0;
		let scrollObserved = -1;
		// The visual viewport height last seen while the keyboard overlapped the layout viewport.
		let keyboardVisualHeight = -1;
		let smallViewportProbe: HTMLElement | null = null;

		// New Chrome on iOS shrinks `svh` for the keyboard, then the layout viewport to the visual
		// viewport, which moves fixed content itself. Remembering the keyboard's visual height keeps it
		// detected once the overlap is gone. A large change in visual height clears it.
		const readKeyboardViewport = (): KeyboardVisualViewport | null => {
			if (!visualViewport || visualViewport.scale !== 1) return null;
			const layoutHeight = win.innerHeight;
			const visualHeight = visualViewport.height;
			if (layoutHeight - visualHeight > KEYBOARD_RESIZE_THRESHOLD) {
				keyboardVisualHeight = visualHeight;
			} else if (Math.abs(visualHeight - keyboardVisualHeight) > KEYBOARD_RESIZE_THRESHOLD) {
				keyboardVisualHeight = -1;
				return null;
			}
			if (!smallViewportProbe) {
				smallViewportProbe = doc.createElement('div');
				smallViewportProbe.style.cssText = 'position:fixed;top:0;height:100svh;visibility:hidden';
				doc.body.appendChild(smallViewportProbe);
			}
			const layoutFollowsKeyboard =
				smallViewportProbe.offsetHeight - visualHeight <= KEYBOARD_RESIZE_THRESHOLD;
			const top = Math.max(0, visualViewport.offsetTop);
			return {
				top,
				// Fixed content already sits above the keyboard, so an inset would lift it twice.
				bottom: layoutFollowsKeyboard ? layoutHeight : Math.min(layoutHeight, top + visualHeight),
				resizing: layoutFollowsKeyboard && Math.abs(layoutHeight - visualHeight) >= 1
			};
		};
		getKeyboardViewport = readKeyboardViewport;

		const setInset = (inset: number) => {
			root.style.setProperty(
				DrawerViewportCssVars.keyboardInset,
				`${Math.max(0, Math.ceil(inset))}px`
			);
		};

		// WebKit's reveal scroll can move the page even while the scroll lock hides overflow, for
		// example when the keyboard's previous/next arrows move focus. While a modal drawer is open
		// any such window scroll is spurious, so pin the page where it was when the drawer opened.
		const baseScrollX = win.scrollX;
		const baseScrollY = win.scrollY;

		const restoreWindowScroll = () => {
			if (
				modal !== true ||
				nested ||
				!focusedKeyboardTarget ||
				(win.scrollX === baseScrollX && win.scrollY === baseScrollY) ||
				readKeyboardViewport() == null
			) {
				return false;
			}
			// `instant`: the two-argument form follows the page's `scroll-behavior`, and a smooth
			// restore would re-emit `scroll` while the measurements below assume the page is at rest.
			win.scrollTo({ left: baseScrollX, top: baseScrollY, behavior: 'instant' });
			return true;
		};

		// Native focus moves (the keyboard's previous/next arrows) commit WebKit's reveal before
		// `focusin` reaches us, and undoing it afterwards jitters the sheet. `focusout` on the
		// outgoing field fires first, so the incoming field's geometry is overridden there and
		// restored in `focusin`.
		let restorePreemptedFocus: (() => void) | null = null;

		const consumePreemptedFocus = () => {
			restorePreemptedFocus?.();
			restorePreemptedFocus = null;
		};

		const preemptFocusReveal = (target: HTMLElement, viewport: KeyboardVisualViewport) => {
			consumePreemptedFocus();
			// Native focus has no preventScroll, so a fake off-screen rect would make WebKit scroll the
			// drawer's scroll containers chasing it. Presenting the field as centered in the visible band
			// makes the in-page reveal and the viewport pan no-ops.
			const rect = target.getBoundingClientRect();
			restorePreemptedFocus = overrideGeometryDuringFocus(
				target,
				(viewport.top + viewport.bottom - rect.top - rect.bottom) / 2
			);
		};

		const alignFocusedKeyboardTarget = () => {
			// Focus that never lands on a preempted target still gets restored here before paint.
			consumePreemptedFocus();

			const target = focusedKeyboardTarget;
			// A field removed without `focusout` is cleaned up on the next focus or viewport event, or
			// when the drawer closes.
			if (nested || !target || !contains(root, target)) {
				setInset(0);
				restoreKeyboardScrollAdjustment();
				return;
			}

			// Undo a reveal scroll on the locked page before measuring.
			restoreWindowScroll();

			const viewport = readKeyboardViewport();
			if (!viewport) {
				setInset(0);
				restoreKeyboardScrollAdjustment();
				return;
			}

			setInset(Math.max(0, win.innerHeight - viewport.bottom));

			const scrollTarget = findKeyboardScrollTarget(target, root);
			if (!scrollTarget) {
				restoreKeyboardScrollAdjustment();
				return;
			}

			const scrollRect = scrollTarget.getBoundingClientRect();
			const clippedBottom = Math.min(scrollRect.bottom, viewport.bottom);
			setKeyboardScrollSlack(scrollTarget, Math.max(0, scrollRect.bottom - viewport.bottom));

			const maxScrollTop = Math.max(0, scrollTarget.scrollHeight - scrollTarget.clientHeight);
			if (maxScrollTop <= 0) return;

			const visibleTop = Math.max(scrollRect.top, viewport.top) + KEYBOARD_VISIBILITY_MARGIN;
			const visibleBottom = clippedBottom - KEYBOARD_VISIBILITY_MARGIN;
			if (visibleBottom <= visibleTop) return;

			const targetRect = target.getBoundingClientRect();
			const destination = Math.round(
				clamp(
					scrollTarget.scrollTop +
						(targetRect.top + targetRect.bottom - visibleTop - visibleBottom) / 2,
					0,
					maxScrollTop
				)
			);

			// WebKit restarts a smooth scroll re-issued while the layout viewport resizes.
			const settled =
				scrollElement === scrollTarget &&
				!viewport.resizing &&
				Math.abs(scrollDestination - destination) <= 1;

			if (!settled) {
				// Commit only once the destination holds across two checks. Layout may still be reacting
				// to the focus change, and scrolling toward a mid-transition destination overshoots.
				const checks = scrollElement === scrollTarget ? scrollChecks + 1 : 1;
				scrollElement = scrollTarget;
				scrollDestination = destination;
				scrollChecks = checks;
				scrollObserved = -1;
				if (checks <= KEYBOARD_SETTLE_FRAME_LIMIT) {
					keyboardFocusFrame.request(alignFocusedKeyboardTarget);
					return;
				}
			} else if (scrollObserved >= 0) {
				// A scroll toward this destination is already out. Re-issuing restarts the easing, so
				// re-issue only when it stalled short, as when WebKit's reveal cancels it.
				const current = scrollTarget.scrollTop;
				if (Math.abs(current - destination) <= 1) return;
				if (current !== scrollObserved) {
					scrollObserved = current;
					return;
				}
			}

			scrollElement = scrollTarget;
			scrollDestination = destination;
			scrollChecks = 0;
			scrollObserved = scrollTarget.scrollTop;
			animateKeyboardScroll(scrollTarget, destination);
		};

		const scheduleAlignment = () => keyboardFocusFrame.request(alignFocusedKeyboardTarget);

		// With the keyboard already up, a focus move brings no viewport resize, and WebKit resolves
		// its reveal asynchronously and cancels a scroll in flight. Re-align on an interval until both
		// settle. The bookkeeping observes before re-issuing, so passes on course do nothing.
		const scheduleDelayedRealign = () => {
			let remaining = KEYBOARD_REALIGN_MAX_PASSES;
			const realign = () => {
				alignFocusedKeyboardTarget();
				remaining -= 1;
				if (remaining > 0) keyboardRealignTimeout.start(KEYBOARD_REALIGN_INTERVAL, realign);
			};
			keyboardRealignTimeout.start(KEYBOARD_REALIGN_INTERVAL, realign);
		};

		// A tap's compatibility mousedown moves focus before mouseup and click hit-test the same
		// point. Releasing the inset and slack later keeps the target under the finger.
		const releaseFocusedKeyboardTarget = () => {
			focusedKeyboardTarget = null;
			keyboardVisualHeight = -1;
			keyboardRealignTimeout.clear();
			scheduleAlignment();
		};

		const captureFocusedKeyboardTarget = (eventTarget: EventTarget | null) => {
			if (nested) return false;
			const target = resolveKeyboardInputTarget(eventTarget);
			if (!target || !contains(root, target)) return false;
			// A new field starts a fresh alignment.
			if (focusedKeyboardTarget !== target) scrollElement = null;
			// eslint-disable-next-line sveltery/no-previous-value-effect -- runs from focus listeners, not on effect re-runs
			focusedKeyboardTarget = target;
			return true;
		};

		const handleFocus = (event: FocusEvent) => {
			const target = focusedKeyboardTarget;
			// iOS 27 dispatches focus before it records the native focus options. Reapply
			// preventScroll before focusin so keyboard-arrow navigation keeps it.
			if (restorePreemptedFocus && target && target === getTarget(event)) {
				target.focus({ preventScroll: true });
			}
		};

		const handleFocusIn = (event: FocusEvent) => {
			// The programmatic focus is over once focus lands. A later `focusout` is the consumer's own.
			programmaticKeyboardFocus = false;
			consumePreemptedFocus();
			if (!captureFocusedKeyboardTarget(getTarget(event))) {
				// Focus landed outside any keyboard input. The tap path suppresses the previous field's
				// `focusout`, so reconcile against the real focus here.
				releaseFocusedKeyboardTarget();
				return;
			}
			if (readKeyboardViewport() != null) scheduleDelayedRealign();
			scheduleAlignment();
		};

		const handleFocusOut = (event: FocusEvent) => {
			// The blur inside `focusKeyboardInputWithoutPageScroll` is followed by a re-focus. Handling
			// it would run the reveal against the off-screen geometry.
			if (programmaticKeyboardFocus) return;
			if (captureFocusedKeyboardTarget(event.relatedTarget)) {
				const target = focusedKeyboardTarget;
				const viewport = readKeyboardViewport();
				if (target && viewport) preemptFocusReveal(target, viewport);
				scheduleAlignment();
				return;
			}
			releaseFocusedKeyboardTarget();
		};

		const handleViewportUpdate = () => {
			if (focusedKeyboardTarget || captureFocusedKeyboardTarget(activeElement(doc))) {
				scheduleAlignment();
			}
		};

		const handleWindowScroll = () => {
			// Measurements taken mid-reveal inflate the inset, so recompute once the page is at rest.
			if (restoreWindowScroll()) scheduleAlignment();
		};

		// A finger down owns the scroll position. Stop the settle loop and the delayed passes, which
		// cannot tell a user scroll from a canceled reveal.
		const cancelRealignOnPointerDown = () => {
			// Keep a pending cleanup when focus already left the keyboard input.
			if (focusedKeyboardTarget) keyboardFocusFrame.cancel();
			keyboardRealignTimeout.clear();
			scrollElement = null;
		};

		const cleanups: (() => void)[] = [];
		const listen = (
			target: EventTarget,
			type: string,
			handler: (event: never) => void,
			capture = false
		) => {
			cleanups.push(on(target, type, handler as EventListener, { capture }));
		};

		if (visualViewport) {
			listen(visualViewport, 'resize', handleViewportUpdate);
			listen(visualViewport, 'scroll', handleViewportUpdate);
			// Chrome can keep resizing the layout viewport after visual viewport events stop.
			listen(win, 'resize', handleViewportUpdate);
		}
		listen(doc, 'focus', handleFocus, true);
		listen(doc, 'focusin', handleFocusIn, true);
		listen(doc, 'focusout', handleFocusOut, true);
		listen(win, 'scroll', handleWindowScroll);
		listen(doc, 'pointerdown', cancelRealignOnPointerDown, true);

		if (captureFocusedKeyboardTarget(activeElement(doc))) scheduleAlignment();

		return () => {
			for (const cleanup of cleanups) cleanup();
			consumePreemptedFocus();
			focusedKeyboardTarget = null;
			restoreKeyboardScrollAdjustment();
			keyboardFocusFrame.cancel();
			keyboardRealignTimeout.clear();
			getKeyboardViewport = null;
			smallViewportProbe?.remove();
			root.style.removeProperty(DrawerViewportCssVars.keyboardInset);
		};
	});

	setDrawerVirtualKeyboard({
		onTouchStart(event) {
			const touch = event.touches[0];
			pendingKeyboardFocusMoved = false;
			keyboardTouchStart = { x: touch.clientX, y: touch.clientY };
		},
		onTouchMove(event) {
			const touch = event.touches[0];
			const start = keyboardTouchStart;
			if (!touch || !start || pendingKeyboardFocusMoved) return;
			// Past the threshold the gesture is a scroll or swipe, not a tap to focus.
			if (
				Math.abs(touch.clientX - start.x) > INPUT_TAP_MOVE_THRESHOLD ||
				Math.abs(touch.clientY - start.y) > INPUT_TAP_MOVE_THRESHOLD
			) {
				pendingKeyboardFocusMoved = true;
			}
		},
		onTouchEnd(event) {
			const root = rootElement;
			if (
				!store.open ||
				!store.mounted ||
				nestedDrawerOpen ||
				!root ||
				!keyboardTouchStart ||
				pendingKeyboardFocusMoved
			) {
				resetTouchTrackingState();
				return;
			}

			const touch = event.changedTouches[0] ?? event.touches[0];
			const pointTarget = touch
				? resolveKeyboardTouchTargetFromPoint(root.getRootNode(), touch.clientX, touch.clientY)
				: null;

			// The lift point landed on another interactive element or label. Let its native tap through.
			if (pointTarget === KEYBOARD_TAP_BLOCKED) {
				resetTouchTrackingState();
				return;
			}

			const keyboardTarget = touch && (pointTarget ?? resolveKeyboardTouchTarget(getTarget(event)));
			if (
				keyboardTarget &&
				(!contains(root, keyboardTarget.focusTarget) || !contains(root, keyboardTarget.clickTarget))
			) {
				resetTouchTrackingState();
				return;
			}

			if (keyboardTarget) {
				const { clickTarget, focusTarget } = keyboardTarget;
				const win = ownerWindow(focusTarget);

				// Pinch-zoomed, alignment is suspended. Native behavior handles focus and the caret.
				if (win.visualViewport && win.visualViewport.scale !== 1) {
					resetTouchTrackingState();
					return;
				}

				// Already focused with the keyboard up: let the native tap reposition the caret.
				if (
					activeElement(ownerDocument(focusTarget)) === focusTarget &&
					(!win.visualViewport || getKeyboardViewport?.() != null)
				) {
					resetTouchTrackingState();
					return;
				}

				// iOS opens the software keyboard only for focus inside the touch gesture. The flag
				// suppresses the `focusout` the intermediate blur would trigger. The `focusin` that lands
				// clears it, and `finally` covers a target that never takes focus.
				event.preventDefault();
				programmaticKeyboardFocus = true;
				try {
					focusKeyboardInputWithoutPageScroll(focusTarget);
				} finally {
					programmaticKeyboardFocus = false;
				}
				// Preventing touchend also suppresses the compatibility mouse events and `click`, so
				// dispatch a replacement on the tap target with the tap coordinates.
				dispatchKeyboardClick(clickTarget, touch);
				// Label activation refocuses its control without preventScroll. Reapply it without
				// blurring or undoing a consumer's focus change.
				if (
					clickTarget !== focusTarget &&
					activeElement(ownerDocument(focusTarget)) === focusTarget
				) {
					focusTarget.focus({ preventScroll: true });
				}
				resetTouchTrackingState();
				return;
			}

			resetTouchTrackingState();
		},
		onTouchCancel: resetTouchTrackingState
	});
</script>

{@render children?.()}
