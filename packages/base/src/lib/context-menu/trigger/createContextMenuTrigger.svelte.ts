// Original ContextMenuTrigger full pointer/long-press/listener business (MIT).
import { untrack } from 'svelte';
import { addEventListener } from '@sveltery/utils/addEventListener';
import { ownerDocument } from '@sveltery/utils/owner';
import { useTimeout } from '@sveltery/utils/useTimeout';
import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
import { contains, getTarget } from '../../floating-ui/utils/element.js';
import { stopEvent } from '../../floating-ui/utils/event.js';
import { useContextMenuRootContext } from '../root/ContextMenuRootContext.js';
import { useMenuRootContext } from '../../menu/root/MenuRootContext.js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { REASONS } from '../../internals/reasons.js';
import { findRootOwnerId } from '../../menu/utils/findRootOwnerId.js';
import type { ContextMenuTriggerProps, ContextMenuTriggerState } from '../types.js';
const LONG_PRESS_DELAY = 500;
export function createContextMenuTrigger(getProps: () => ContextMenuTriggerProps) {
  const { render, class: className, style, children, ref, ...elementProps } = $derived(getProps());
  // Host render/ref fields are consumed by the native component, excluded from forwarded props.
  untrack(() => {
    void [render, className, style, children, ref];
  });
  const {
    setAnchor,
    actionsRef,
    internalBackdropRef,
    backdropRef,
    positionerRef,
    allowMouseUpTriggerRef,
    initialCursorPointRef,
    rootId,
  } = useContextMenuRootContext(false);
  const { store } = useMenuRootContext(false);
  const open = $derived(store.useState('open'));
  const disabled = $derived(store.useState('disabled'));
  const triggerRef = { current: null as HTMLDivElement | null };
  const touchPositionRef = {
    current: null as {
      x: number;
      y: number;
    } | null,
  };
  const longPressTimeout = useTimeout();
  const allowMouseUpTimeout = useTimeout();
  const allowMouseUpRef = { current: false };
  const mouseUpAbortControllerRef = { current: null as AbortController | null };
  function handleLongPress(x: number, y: number, event: MouseEvent | TouchEvent) {
    const isTouchEvent = event.type.startsWith('touch');
    initialCursorPointRef.current = { x, y };
    setAnchor({
      getBoundingClientRect() {
        return DOMRect.fromRect({
          width: isTouchEvent ? 10 : 0,
          height: isTouchEvent ? 10 : 0,
          x,
          y,
        });
      },
    });
    allowMouseUpRef.current = false;
    actionsRef.current?.setOpen(true, createChangeEventDetails(REASONS.triggerPress, event));
    allowMouseUpTimeout.start(LONG_PRESS_DELAY, () => {
      allowMouseUpRef.current = true;
    });
  }
  function handleContextMenu(event: MouseEvent) {
    if (disabled) {
      return;
    }
    allowMouseUpTriggerRef.current = true;
    stopEvent(event);
    handleLongPress(event.clientX, event.clientY, event);
    const doc = ownerDocument(triggerRef.current);
    // Abort a listener from a previous trigger that never saw its mouseup, and scope this
    // one to a fresh controller so it's removed on unmount if the mouseup never arrives.
    mouseUpAbortControllerRef.current?.abort();
    const mouseUpAbortController = new AbortController();
    mouseUpAbortControllerRef.current = mouseUpAbortController;
    doc.addEventListener(
      'mouseup',
      (mouseEvent) => {
        allowMouseUpTriggerRef.current = false;
        if (!allowMouseUpRef.current) {
          return;
        }
        allowMouseUpTimeout.clear();
        allowMouseUpRef.current = false;
        const mouseUpTarget = getTarget(mouseEvent) as Element | null;
        if (contains(positionerRef.current, mouseUpTarget)) {
          return;
        }
        if (rootId && mouseUpTarget && findRootOwnerId(mouseUpTarget) === rootId) {
          return;
        }
        actionsRef.current?.setOpen(
          false,
          createChangeEventDetails(REASONS.cancelOpen, mouseEvent),
        );
      },
      { once: true, signal: mouseUpAbortController.signal },
    );
  }
  function cancelLongPress() {
    longPressTimeout.clear();
    touchPositionRef.current = null;
  }
  function handleTouchStart(event: TouchEvent) {
    if (disabled) {
      cancelLongPress();
      return;
    }
    allowMouseUpTriggerRef.current = false;
    if (event.touches.length !== 1) {
      cancelLongPress();
      return;
    }
    event.stopPropagation();
    const touch = event.touches[0];
    const touchPosition = { x: touch.clientX, y: touch.clientY };
    touchPositionRef.current = touchPosition;
    longPressTimeout.start(LONG_PRESS_DELAY, () => {
      handleLongPress(touchPosition.x, touchPosition.y, event);
    });
  }
  function handleTouchMove(event: TouchEvent) {
    if (event.touches.length !== 1) {
      cancelLongPress();
      return;
    }
    if (longPressTimeout.isStarted() && touchPositionRef.current) {
      const touch = event.touches[0];
      const moveThreshold = 10;
      const deltaX = Math.abs(touch.clientX - touchPositionRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchPositionRef.current.y);
      if (deltaX > moveThreshold || deltaY > moveThreshold) {
        cancelLongPress();
      }
    }
  }
  useIsoLayoutEffect(
    () => () => {
      // Abort a pending mouseup listener if the trigger unmounts before it fires.
      mouseUpAbortControllerRef.current?.abort();
    },
    () => [],
  );
  useIsoLayoutEffect(
    () => {
      function handleDocumentContextMenu(event: MouseEvent) {
        if (disabled) {
          return;
        }
        const target = getTarget(event);
        const targetElement = target as HTMLElement | null;
        if (
          contains(triggerRef.current, targetElement) ||
          contains(internalBackdropRef.current, targetElement) ||
          contains(backdropRef.current, targetElement)
        ) {
          event.preventDefault();
        }
      }
      const doc = ownerDocument(triggerRef.current);
      return addEventListener(doc, 'contextmenu', handleDocumentContextMenu);
    },
    () => [backdropRef, disabled, internalBackdropRef],
  );
  const state: ContextMenuTriggerState = $derived({
    open,
  });
  return {
    triggerRef,
    get state() {
      return state;
    },
    get elementProps() {
      return elementProps;
    },
    props: {
      oncontextmenu: handleContextMenu,
      ontouchstart: handleTouchStart,
      ontouchmove: handleTouchMove,
      ontouchend: cancelLongPress,
      ontouchcancel: cancelLongPress,
      style: { WebkitTouchCallout: 'none' },
    },
  };
}
