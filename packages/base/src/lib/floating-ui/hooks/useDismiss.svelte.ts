// Ported business body from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
import { addEventListener } from '@sveltery/utils/addEventListener';
import { mergeCleanups } from '@sveltery/utils/mergeCleanups';
import { ownerDocument } from '@sveltery/utils/owner';
import { useStableCallback } from '@sveltery/utils/useStableCallback';
import { Timeout, useTimeout } from '@sveltery/utils/useTimeout';
import {
  getComputedStyle,
  getParentNode,
  isElement,
  isHTMLElement,
  isLastTraversableNode,
  isShadowRoot,
} from '@floating-ui/utils/dom';
import { platform } from '@sveltery/utils/platform';
import { useFloatingTree } from '../components/FloatingTree.svelte.js';
import { FloatingTreeStore } from '../components/FloatingTreeStore.js';
import type { ElementProps, FloatingContext, FloatingRootContext } from '../types.js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import type { FloatingUIOpenChangeDetails } from '../types.js';
import { REASONS } from '../../internals/reasons.js';
import { createAttribute } from '../utils/createAttribute.js';
import { contains, getTarget, isEventTargetWithin, isRootElement } from '../utils/element.js';
import { isVirtualClick } from '../utils/event.js';
import { getNodeChildren } from '../utils/nodes.js';

type PressType = 'intentional' | 'sloppy';

function alwaysFalse() {
  return false;
}

export function normalizeProp(
  normalizable?: boolean | { escapeKey?: boolean | undefined; outsidePress?: boolean | undefined },
) {
  return {
    escapeKey:
      typeof normalizable === 'boolean' ? normalizable : (normalizable?.escapeKey ?? false),
    outsidePress:
      typeof normalizable === 'boolean' ? normalizable : (normalizable?.outsidePress ?? true),
  };
}

export interface UseDismissProps {
  /**
   * Whether the Hook is enabled, including all internal Effects and event
   * handlers.
   * @default true
   */
  enabled?: boolean | undefined;
  /**
   * Whether to dismiss the floating element upon pressing the `esc` key.
   * @default true
   */
  escapeKey?: boolean | undefined;
  /**
   * Whether to dismiss the floating element upon pressing the reference
   * element. You likely want to ensure the `move` option in the `useHover()`
   * Hook has been disabled when this is in use.
   *
   * A lazy getter invoked when handling reference press events.
   * @default false
   */
  referencePress?: (() => boolean) | undefined;
  /**
   * Whether to dismiss the floating element upon pressing outside of the
   * floating element.
   * If you have another element, like a toast, that is rendered outside the
   * floating element's React tree and don't want the floating element to close
   * when pressing it, you can guard the check like so:
   * ```jsx
   * useDismiss(context, {
   *   outsidePress: (event) => !event.target.closest('.toast'),
   * });
   * ```
   * @default true
   */
  outsidePress?: boolean | ((event: MouseEvent | TouchEvent) => boolean) | undefined;
  /**
   * The type of event to use to determine an outside "press".
   * - `intentional` dismisses on an outside `click` whose press began while the floating element was open, ignoring the trailing click of a press that started before it opened. Touch requires minimal `touchmove`s, and press-less clicks (keyboard, assistive technology) are always accepted.
   * - `sloppy` fires on `pointerdown` for mouse, while for touch it fires on `touchend` (within 1 second) or while scrolling away after `touchstart`.
   */
  outsidePressEvent?:
    | PressType
    | {
        mouse: PressType;
        touch: PressType;
      }
    | (() =>
        | PressType
        | {
            mouse: PressType;
            touch: PressType;
          })
    | undefined;
  /**
   * Determines whether event listeners bubble upwards through a tree of
   * floating elements.
   */
  bubbles?:
    boolean | { escapeKey?: boolean | undefined; outsidePress?: boolean | undefined } | undefined;
  /**
   * External FloatingTree to use when the one provided by context can't be used.
   */
  externalTree?: FloatingTreeStore | undefined;
}

/**
 * Closes the floating element when a dismissal is requested — by default, when
 * the user presses the `escape` key or outside of the floating element.
 * @see https://floating-ui.com/docs/useDismiss
 */
export function useDismiss(
  getContext: () => FloatingRootContext | FloatingContext,
  getProps: () => UseDismissProps = () => ({}),
): ElementProps {
  const context = $derived(getContext());
  const {
    enabled = true,
    escapeKey = true,
    outsidePress: outsidePressProp = true,
    outsidePressEvent = 'sloppy',
    referencePress = alwaysFalse,
    bubbles,
    externalTree,
  } = $derived(getProps());

  const store = $derived('rootStore' in context ? context.rootStore : context);

  const open = $derived(store.useState('open'));
  const floatingElement = $derived(store.useState('floatingElement'));
  const { dataRef, events } = $derived(store.context);

  const contextTree = useFloatingTree();
  const tree = $derived(externalTree ?? contextTree);
  const outsidePressFn = useStableCallback(
    (event: MouseEvent | TouchEvent) => typeof outsidePressProp === 'function' ? outsidePressProp(event) : false,
  );
  const outsidePress = $derived(typeof outsidePressProp === 'function' ? outsidePressFn : outsidePressProp);
  const outsidePressEnabled = $derived(outsidePress !== false);
  const getOutsidePressEventProp = useStableCallback(() => outsidePressEvent);

  const { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles } = $derived(normalizeProp(bubbles));

  const pressStartedInsideRef = { current: false };
  const pressStartPreventedRef = { current: false };
  // Ignore only the very next outside click after dragging from inside to outside.
  const suppressNextOutsideClickRef = { current: false };
  // A click whose press began before the floating element opened is the tail of that
  // gesture (e.g. the drag-release that opened it), not a new outside press.
  const sawPressWhileOpenRef = { current: false };
  const isComposingRef = { current: false };
  const currentPointerTypeRef = { current: '' as PointerEvent['pointerType'] };

  const touchStateRef = { current: null as {
    startTime: number;
    startX: number;
    startY: number;
    dismissOnTouchEnd: boolean;
    dismissOnMouseDown: boolean;
  } | null };

  const cancelDismissOnEndTimeout = useTimeout();
  const clearInsideTreeTimeout = useTimeout();

  const clearInsideTree = useStableCallback(() => {
    clearInsideTreeTimeout.clear();
    dataRef.current.insideTree = false;
  });

  const hasBlockingChild = useStableCallback(
    (bubbleKey: '__escapeKeyBubbles' | '__outsidePressBubbles') => {
      const nodeId = dataRef.current.floatingContext?.nodeId;
      const children = tree ? getNodeChildren(tree.nodesRef.current, nodeId) : [];

      return children.some(
        (child) => child.context?.open && !child.context.dataRef.current[bubbleKey],
      );
    },
  );

  const isEventWithinOwnElements = useStableCallback((event: Event) => {
    return (
      isEventTargetWithin(event, store.select('floatingElement')) ||
      isEventTargetWithin(event, store.select('domReferenceElement'))
    );
  });

  const closeOnReferencePress = useStableCallback((event: Event) => {
    if (!referencePress()) {
      return;
    }

    store.setOpen(
      false,
      createChangeEventDetails(
        REASONS.triggerPress,
        event as MouseEvent | PointerEvent | TouchEvent | KeyboardEvent,
      ),
    );
  });

  const closeOnEscapeKeyDown = useStableCallback(
    (event: KeyboardEvent) => {
      if (!open || !enabled || !escapeKey || event.key !== 'Escape') {
        return;
      }

      // Wait until IME is settled. Pressing `Escape` while composing should
      // close the compose menu, but not the floating element.
      if (isComposingRef.current) {
        return;
      }

      if (!escapeKeyBubbles && hasBlockingChild('__escapeKeyBubbles')) {
        return;
      }

      const native = event;
      const eventDetails = createChangeEventDetails(REASONS.escapeKey, native);

      store.setOpen(false, eventDetails);

      if (!eventDetails.isCanceled) {
        event.preventDefault();
      }

      if (!escapeKeyBubbles && !eventDetails.isPropagationAllowed) {
        event.stopPropagation();
      }
    },
  );

  const markInsideTree = useStableCallback(() => {
    dataRef.current.insideTree = true;
    clearInsideTreeTimeout.start(0, clearInsideTree);
  });

  const markPressStartedInsideTree = useStableCallback(
    (event: PointerEvent | MouseEvent) => {
      if (!open || !enabled || event.button !== 0) {
        return;
      }

      const target = getTarget(event) as Element | null;

      // Only treat presses that start within the floating DOM subtree as inside.
      // This avoids suppressing parent dismissal when interacting with nested portals.
      if (!contains(store.select('floatingElement'), target)) {
        return;
      }

      if (!pressStartedInsideRef.current) {
        pressStartedInsideRef.current = true;
        pressStartPreventedRef.current = false;
      }
    },
  );

  const markInsidePressStartPrevented = useStableCallback(
    (event: PointerEvent | MouseEvent) => {
      if (!open || !enabled) {
        return;
      }

      if (!(event.defaultPrevented || event.defaultPrevented)) {
        return;
      }

      if (pressStartedInsideRef.current) {
        pressStartPreventedRef.current = true;
      }
    },
  );

  // A same-batch close+reopen never renders `open === false`, so only `openchange` can
  // observe that session boundary. The effect below covers controlled flips.
  useIsoLayoutEffect(() => {
    function handleOpenChange(details: FloatingUIOpenChangeDetails) {
      // Only the closing half ends the session: `setOpen(true)` on an already-open
      // element (hovering an inactive trigger) must not drop a press mid-gesture.
      if (!details.open) {
        sawPressWhileOpenRef.current = false;
      }
    }

    events.on('openchange', handleOpenChange);
    return () => {
      events.off('openchange', handleOpenChange);
    };
  }, () => [events]);

  useIsoLayoutEffect(() => {
    if (!open || !enabled) {
      // Reset in the effect body, not the cleanup, which also runs when a dependency
      // changes mid-gesture.
      if (!open) {
        sawPressWhileOpenRef.current = false;
      }
      return clearInsideTree;
    }

    dataRef.current.__escapeKeyBubbles = escapeKeyBubbles;
    dataRef.current.__outsidePressBubbles = outsidePressBubbles;

    const compositionTimeout = new Timeout();
    const preventedPressSuppressionTimeout = new Timeout();
    const doc = ownerDocument(floatingElement);

    function handleCompositionStart() {
      compositionTimeout.clear();
      isComposingRef.current = true;
    }

    function handleCompositionEnd() {
      // Safari fires `compositionend` before `keydown`, so we need to wait
      // until the next tick to set `isComposing` to `false`.
      // https://bugs.webkit.org/show_bug.cgi?id=165004
      compositionTimeout.start(
        // 0ms or 1ms don't work in Safari. 5ms appears to consistently work.
        // Only apply to WebKit for the test to remain 0ms.
        platform.engine.webkit ? 5 : 0,
        () => {
          isComposingRef.current = false;
        },
      );
    }

    function suppressImmediateOutsideClickAfterPreventedStart() {
      suppressNextOutsideClickRef.current = true;
      // Firefox can emit the synthetic outside click in a later task after
      // pointer lock exit, so microtask clearing is too early here.
      preventedPressSuppressionTimeout.start(0, () => {
        suppressNextOutsideClickRef.current = false;
      });
    }

    function resetPressStartState() {
      pressStartedInsideRef.current = false;
      pressStartPreventedRef.current = false;
    }

    function getOutsidePressEvent(): PressType {
      const type = currentPointerTypeRef.current as 'pen' | 'mouse' | 'touch' | '';
      const computedType = type === 'pen' || !type ? 'mouse' : type;

      const outsidePressEventValue = getOutsidePressEventProp();
      const resolved =
        typeof outsidePressEventValue === 'function'
          ? outsidePressEventValue()
          : outsidePressEventValue;

      if (typeof resolved === 'string') {
        return resolved;
      }

      return resolved[computedType];
    }

    function shouldIgnoreEvent(event: Event) {
      const computedOutsidePressEvent = getOutsidePressEvent();
      return (
        (computedOutsidePressEvent === 'intentional' && event.type !== 'click') ||
        (computedOutsidePressEvent === 'sloppy' && event.type === 'click')
      );
    }

    function isEventWithinFloatingTree(event: Event) {
      const nodeId = dataRef.current.floatingContext?.nodeId;
      const targetIsInsideChildren =
        tree &&
        getNodeChildren(tree.nodesRef.current, nodeId).some((node) =>
          isEventTargetWithin(event, node.context?.elements.floating),
        );

      return isEventWithinOwnElements(event) || targetIsInsideChildren;
    }

    function closeOnPressOutside(event: MouseEvent | PointerEvent | TouchEvent) {
      if (shouldIgnoreEvent(event)) {
        // A new press began outside the floating element and its trigger. Clear any
        // leftover drag-out suppression so this press's eventual click can dismiss.
        if (event.type !== 'click' && !isEventWithinOwnElements(event)) {
          preventedPressSuppressionTimeout.clear();
          suppressNextOutsideClickRef.current = false;
        }
        clearInsideTree();
        return;
      }

      if (dataRef.current.insideTree) {
        clearInsideTree();
        return;
      }

      const target = getTarget(event);
      const inertSelector = `[${createAttribute('inert')}]`;
      const targetRoot = isElement(target) ? target.getRootNode() : null;
      const markers = Array.from(
        (isShadowRoot(targetRoot)
          ? targetRoot
          : ownerDocument(store.select('floatingElement'))
        ).querySelectorAll(inertSelector),
      );

      const triggers = store.context.triggerElements;

      // If another trigger is clicked, don't close the floating element.
      if (
        target &&
        (triggers.hasElement(target as Element) ||
          triggers.hasMatchingElement((trigger) => contains(trigger, target as Element)))
      ) {
        return;
      }

      let targetRootAncestor = isElement(target) ? target : null;
      while (targetRootAncestor && !isLastTraversableNode(targetRootAncestor)) {
        const nextParent = getParentNode(targetRootAncestor);
        if (isLastTraversableNode(nextParent) || !isElement(nextParent)) {
          break;
        }

        targetRootAncestor = nextParent;
      }

      // Check if the click occurred on a third-party element injected after the
      // floating element rendered.
      if (
        markers.length &&
        isElement(target) &&
        !isRootElement(target) &&
        // Clicked on a direct ancestor (e.g. FloatingOverlay).
        !contains(target, store.select('floatingElement')) &&
        // If the target root element contains none of the markers, then the
        // element was injected after the floating element rendered.
        markers.every((marker) => !contains(targetRootAncestor, marker))
      ) {
        return;
      }

      // Check if the click occurred on the scrollbar
      // Skip for touch events: scrollbars don't receive touch events on most platforms
      if (isHTMLElement(target) && !('touches' in event)) {
        const lastTraversableNode = isLastTraversableNode(target);
        const style = getComputedStyle(target);
        const scrollRe = /auto|scroll/;
        const isScrollableX = lastTraversableNode || scrollRe.test(style.overflowX);
        const isScrollableY = lastTraversableNode || scrollRe.test(style.overflowY);

        const canScrollX =
          isScrollableX && target.clientWidth > 0 && target.scrollWidth > target.clientWidth;
        const canScrollY =
          isScrollableY && target.clientHeight > 0 && target.scrollHeight > target.clientHeight;

        const isRTL = style.direction === 'rtl';

        // Check click position relative to scrollbar.
        // In some browsers it is possible to change the <body> (or window)
        // scrollbar to the left side, but is very rare and is difficult to
        // check for. Plus, for modal dialogs with backdrops, it is more
        // important that the backdrop is checked but not so much the window.
        const pressedVerticalScrollbar =
          canScrollY &&
          (isRTL
            ? event.offsetX <= target.offsetWidth - target.clientWidth
            : event.offsetX > target.clientWidth);

        const pressedHorizontalScrollbar = canScrollX && event.offsetY > target.clientHeight;

        if (pressedVerticalScrollbar || pressedHorizontalScrollbar) {
          return;
        }
      }

      if (isEventWithinFloatingTree(event)) {
        return;
      }

      // Only `click` events reach this point in intentional mode.
      if (getOutsidePressEvent() === 'intentional') {
        // Press-less clicks (keyboard, assistive technology, `element.click()`) report no
        // click count; `isVirtualClick` also catches the ones that do.
        if (
          (event as MouseEvent).detail !== 0 &&
          !isVirtualClick(event as MouseEvent) &&
          !sawPressWhileOpenRef.current
        ) {
          return;
        }

        // A press that starts inside and ends outside gets one suppressed
        // outside click. Run this after inside-target checks so inside clicks
        // don't consume the one-shot suppression.
        if (suppressNextOutsideClickRef.current) {
          preventedPressSuppressionTimeout.clear();
          suppressNextOutsideClickRef.current = false;
          return;
        }
      }

      if (typeof outsidePress === 'function' && !outsidePress(event)) {
        return;
      }

      if (hasBlockingChild('__outsidePressBubbles')) {
        return;
      }

      store.setOpen(false, createChangeEventDetails(REASONS.outsidePress, event));
      clearInsideTree();
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        getOutsidePressEvent() !== 'sloppy' ||
        event.pointerType === 'touch' ||
        !store.select('open') ||
        !enabled ||
        isEventWithinOwnElements(event)
      ) {
        return;
      }

      closeOnPressOutside(event);
    }

    function handleTouchStart(event: TouchEvent) {
      if (
        getOutsidePressEvent() !== 'sloppy' ||
        !store.select('open') ||
        !enabled ||
        isEventWithinOwnElements(event)
      ) {
        return;
      }

      const touch = event.touches[0];
      if (touch) {
        touchStateRef.current = {
          startTime: Date.now(),
          startX: touch.clientX,
          startY: touch.clientY,
          dismissOnTouchEnd: false,
          dismissOnMouseDown: true,
        };

        cancelDismissOnEndTimeout.start(1000, () => {
          if (touchStateRef.current) {
            touchStateRef.current.dismissOnTouchEnd = false;
            touchStateRef.current.dismissOnMouseDown = false;
          }
        });
      }
    }

    function addTargetEventListenerOnce<EventType extends Event>(
      event: EventType,
      listener: (event: EventType) => void,
    ) {
      const target = getTarget(event);

      if (!target) {
        return;
      }

      const unsubscribe = addEventListener(target, event.type, () => {
        listener(event);
        unsubscribe();
      });
    }

    function handleTouchStartcapture(event: TouchEvent) {
      currentPointerTypeRef.current = 'touch';
      addTargetEventListenerOnce(event, handleTouchStart);
    }

    function closeOnPressOutsidecapture(event: PointerEvent | MouseEvent) {
      cancelDismissOnEndTimeout.clear();

      // Only `pointerdown` marks a press; `mousedown` is its compatibility event, and
      // counting it would misattribute a gesture that started before open.
      if (event.type === 'pointerdown') {
        // Only a primary press can produce a `click`.
        if (event.button === 0) {
          sawPressWhileOpenRef.current = true;
        }
        currentPointerTypeRef.current = (event as PointerEvent).pointerType;
      }

      if (
        event.type === 'mousedown' &&
        touchStateRef.current &&
        !touchStateRef.current.dismissOnMouseDown
      ) {
        return;
      }

      addTargetEventListenerOnce(event, (targetEvent) => {
        if (targetEvent.type === 'pointerdown') {
          handlePointerDown(targetEvent as PointerEvent);
        } else {
          closeOnPressOutside(targetEvent as MouseEvent);
        }
      });
    }

    function handlePressEndcapture(event: PointerEvent | MouseEvent) {
      // A cancelled gesture produces no click. Not cleared on `pointerup`: the click
      // fires after it and must still find the press.
      if (event.type === 'pointercancel') {
        sawPressWhileOpenRef.current = false;
      }

      if (!pressStartedInsideRef.current) {
        return;
      }

      const pressStartedInsideDefaultPrevented = pressStartPreventedRef.current;
      resetPressStartState();

      if (getOutsidePressEvent() !== 'intentional') {
        return;
      }

      if (event.type === 'pointercancel') {
        if (pressStartedInsideDefaultPrevented) {
          suppressImmediateOutsideClickAfterPreventedStart();
        }
        return;
      }

      if (isEventWithinFloatingTree(event)) {
        return;
      }

      // If pointerdown was prevented, no click may be generated for that
      // interaction. However, Firefox may still emit an immediate click after
      // pointerup (e.g. NumberField scrub with pointer lock), so suppress for
      // one tick to absorb that synthetic click only.
      if (pressStartedInsideDefaultPrevented) {
        suppressImmediateOutsideClickAfterPreventedStart();
        return;
      }

      // Avoid suppressing when outsidePress explicitly ignores this target.
      if (typeof outsidePress === 'function' && !outsidePress(event as MouseEvent)) {
        return;
      }

      preventedPressSuppressionTimeout.clear();
      suppressNextOutsideClickRef.current = true;
      clearInsideTree();
    }

    function handleTouchMove(event: TouchEvent) {
      if (
        getOutsidePressEvent() !== 'sloppy' ||
        !touchStateRef.current ||
        isEventWithinOwnElements(event)
      ) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      const deltaX = Math.abs(touch.clientX - touchStateRef.current.startX);
      const deltaY = Math.abs(touch.clientY - touchStateRef.current.startY);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 5) {
        touchStateRef.current.dismissOnTouchEnd = true;
      }

      if (distance > 10) {
        closeOnPressOutside(event);
        cancelDismissOnEndTimeout.clear();
        touchStateRef.current = null;
      }
    }

    function handleTouchMovecapture(event: TouchEvent) {
      addTargetEventListenerOnce(event, handleTouchMove);
    }

    function handleTouchEnd(event: TouchEvent) {
      if (
        getOutsidePressEvent() !== 'sloppy' ||
        !touchStateRef.current ||
        isEventWithinOwnElements(event)
      ) {
        return;
      }

      if (touchStateRef.current.dismissOnTouchEnd) {
        closeOnPressOutside(event);
      }

      cancelDismissOnEndTimeout.clear();
      touchStateRef.current = null;
    }

    function handleTouchEndcapture(event: TouchEvent) {
      addTargetEventListenerOnce(event, handleTouchEnd);
    }

    const unsubscribe = mergeCleanups(
      escapeKey &&
        mergeCleanups(
          addEventListener(doc, 'keydown', closeOnEscapeKeyDown),
          addEventListener(doc, 'compositionstart', handleCompositionStart),
          addEventListener(doc, 'compositionend', handleCompositionEnd),
        ),
      outsidePressEnabled &&
        mergeCleanups(
          addEventListener(doc, 'click', closeOnPressOutsidecapture, true),
          addEventListener(doc, 'pointerdown', closeOnPressOutsidecapture, true),
          addEventListener(doc, 'pointerup', handlePressEndcapture, true),
          addEventListener(doc, 'pointercancel', handlePressEndcapture, true),
          addEventListener(doc, 'mousedown', closeOnPressOutsidecapture, true),
          addEventListener(doc, 'mouseup', handlePressEndcapture, true),
          addEventListener(doc, 'touchstart', handleTouchStartcapture, {
            capture: true,
            passive: true,
          }),
          addEventListener(doc, 'touchmove', handleTouchMovecapture, {
            capture: true,
            passive: true,
          }),
          addEventListener(doc, 'touchend', handleTouchEndcapture, {
            capture: true,
            passive: true,
          }),
        ),
    );

    return () => {
      unsubscribe();
      compositionTimeout.clear();
      preventedPressSuppressionTimeout.clear();
      resetPressStartState();
      suppressNextOutsideClickRef.current = false;
      clearInsideTree();
    };
  }, () => [
    dataRef,
    floatingElement,
    escapeKey,
    outsidePressEnabled,
    outsidePress,
    open,
    enabled,
    escapeKeyBubbles,
    outsidePressBubbles,
    closeOnEscapeKeyDown,
    clearInsideTree,
    getOutsidePressEventProp,
    hasBlockingChild,
    isEventWithinOwnElements,
    tree,
    store,
    cancelDismissOnEndTimeout,
  ]);

  const reference: ElementProps['reference'] = {
      onkeydown: closeOnEscapeKeyDown,
      onpointerdown: closeOnReferencePress,
      onclick: closeOnReferencePress,
    };

  const floating: ElementProps['floating'] = {
      onkeydown: closeOnEscapeKeyDown,
      // `onmousedown` may be blocked if `event.preventDefault()` is called in
      // `onpointerdown`, such as with <NumberField.ScrubArea>.
      // See https://github.com/mui/base-ui/pull/3379
      onpointerdown: markInsidePressStartPrevented,
      onmousedown: markInsidePressStartPrevented,
      onclickcapture: markInsideTree,
      onmousedowncapture(event: MouseEvent) {
        markInsideTree();
        markPressStartedInsideTree(event);
      },
      onpointerdowncapture(event: PointerEvent) {
        markInsideTree();
        markPressStartedInsideTree(event);
      },
      onmouseupcapture: markInsideTree,
      ontouchendcapture: markInsideTree,
      ontouchmovecapture: markInsideTree,
    };

  return { get reference() { return enabled ? reference : undefined; }, get floating() { return enabled ? floating : undefined; }, get trigger() { return enabled ? reference : undefined; } };
}
