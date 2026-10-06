// Source business body from Base UI v1.8.0 usePressAndHold.ts (MIT).
import { onDestroy } from 'svelte';
import { addEventListener } from '@sveltery/utils/addEventListener';
import { NOOP } from '@sveltery/utils/empty';
import { Timeout } from '@sveltery/utils/useTimeout';
import { Interval } from '@sveltery/utils/useInterval';
import { ownerWindow } from '@sveltery/utils/owner';
const DEFAULT_TICK_DELAY = 60;
const DEFAULT_START_DELAY = 400;
const DEFAULT_SCROLL_DISTANCE = 8;
const TOUCH_TIMEOUT = 50;
const MAX_POINTER_MOVES_AFTER_TOUCH = 3;
export function isTouchLikePointerType(pointerType: string) {
  return pointerType === 'touch' || pointerType === 'pen';
}
export interface UsePressAndHoldParameters {
  disabled: boolean;
  tick: (triggerEvent?: Event) => boolean;
  onStop?: ((nativeEvent: PointerEvent) => void) | undefined;
  tickDelay?: number | undefined;
  startDelay?: number | undefined;
  scrollDistance?: number | undefined;
  elementRef: { current: HTMLElement | null };
}
export interface UsePressAndHoldReturnValue {
  pointerHandlers: {
    ontouchstart(event: TouchEvent): void;
    ontouchend(event: TouchEvent): void;
    onpointerdown(event: PointerEvent): void;
    onpointerup(event: PointerEvent): void;
    onpointermove(event: PointerEvent): void;
    onmouseenter(event: MouseEvent): void;
    onmouseleave(event: MouseEvent): void;
    onmouseup(event: MouseEvent): void;
  };
  shouldSkipClick(event: MouseEvent): boolean;
}
export class PressAndHold implements UsePressAndHoldReturnValue {
  pointerHandlers: UsePressAndHoldReturnValue['pointerHandlers'];
  shouldSkipClick: UsePressAndHoldReturnValue['shouldSkipClick'];

  constructor(getParameters: () => UsePressAndHoldParameters) {
    const {
      disabled,
      tick,
      onStop,
      tickDelay = DEFAULT_TICK_DELAY,
      startDelay = DEFAULT_START_DELAY,
      scrollDistance = DEFAULT_SCROLL_DISTANCE,
      elementRef,
    } = $derived(getParameters());
    const startTickTimeout = new Timeout();
    const tickInterval = new Interval();
    const intentionalTouchCheckTimeout = new Timeout();

    const isPressedRef = { current: false };
    const movesAfterTouchRef = { current: 0 };
    const downCoordsRef = { current: { x: 0, y: 0 } };
    const isTouchingButtonRef = { current: false };
    const ignoreClickRef = { current: false };
    const pointerTypeRef = { current: '' };
    const unsubscribeFromGlobalContextMenuRef = { current: NOOP as () => void };
    const unsubscribeFromGlobalPointerUpRef = { current: NOOP as () => void };

    function stopAutoChange() {
      intentionalTouchCheckTimeout.clear();
      startTickTimeout.clear();
      tickInterval.clear();
      unsubscribeFromGlobalContextMenuRef.current();
      movesAfterTouchRef.current = 0;
    }

    function startAutoChange(triggerNativeEvent?: Event) {
      stopAutoChange();

      const element = elementRef.current;
      if (!element) {
        return;
      }

      const win = ownerWindow(element);

      function handleContextMenu(event: Event) {
        event.preventDefault();
      }

      // A global context menu listener is necessary to prevent the context menu from
      // appearing when the touch is slightly outside of the element's hit area.
      unsubscribeFromGlobalContextMenuRef.current = addEventListener(
        win,
        'contextmenu',
        handleContextMenu,
      );

      // The release listener stays registered through `stopAutoChange` so a hold that auto-stops at
      // a boundary (a repeat tick returning `false`) still fires `onStop` on release. Replace any
      // existing one first so a mouseleave/mouseenter cycle during a hold doesn't stack listeners
      // (which would otherwise fire `onStop` more than once on release).
      unsubscribeFromGlobalPointerUpRef.current();
      unsubscribeFromGlobalPointerUpRef.current = addEventListener(
        win,
        'pointerup',
        (event) => {
          isPressedRef.current = false;
          stopAutoChange();
          onStop?.(event);
        },
        { once: true },
      );

      if (!tick(triggerNativeEvent)) {
        stopAutoChange();
        return;
      }

      startTickTimeout.start(startDelay, () => {
        tickInterval.start(tickDelay, () => {
          if (!tick(triggerNativeEvent)) {
            stopAutoChange();
          }
        });
      });
    }

    // Timers and window listeners are external systems owned by this mounted consumer.
    onDestroy(() => {
      stopAutoChange();
      unsubscribeFromGlobalPointerUpRef.current();
    });
    $effect(() => {
      if (disabled) {
        isPressedRef.current = false;
        isTouchingButtonRef.current = false;
        pointerTypeRef.current = '';
        stopAutoChange();
      }
    });
    const pointerHandlers: UsePressAndHoldReturnValue['pointerHandlers'] = {
      ontouchstart() {
        isTouchingButtonRef.current = true;
      },
      ontouchend() {
        isTouchingButtonRef.current = false;
      },
      onpointerdown(event) {
        if (event.defaultPrevented || event.button || disabled) {
          return;
        }

        pointerTypeRef.current = event.pointerType;
        ignoreClickRef.current = false;
        isPressedRef.current = true;
        downCoordsRef.current = { x: event.clientX, y: event.clientY };

        const isTouchPointer = isTouchLikePointerType(event.pointerType);

        if (!isTouchPointer) {
          event.preventDefault();
          startAutoChange(event);
        } else {
          // Check if the pointerdown was intentional and not the result of a scroll or
          // pinch-zoom. In that case, we don't want to start the auto-change sequence.
          intentionalTouchCheckTimeout.start(TOUCH_TIMEOUT, () => {
            const moves = movesAfterTouchRef.current;
            movesAfterTouchRef.current = 0;
            // Only start auto-change if the touch is still pressed (prevents races
            // with pointerup occurring before the timeout fires on quick taps).
            const stillPressed = isPressedRef.current;
            if (stillPressed && moves < MAX_POINTER_MOVES_AFTER_TOUCH) {
              startAutoChange(event);
              ignoreClickRef.current = true; // synthesized click after hold should be ignored
            } else {
              // No auto-change (simple tap or scroll gesture), allow the click handler
              // to perform a single action.
              ignoreClickRef.current = false;
              stopAutoChange();
            }
          });
        }
      },
      onpointerup(event) {
        // Ensure we mark the press as released for touch flows even if auto-change never
        // started, so the delayed auto-change check won't start after a quick tap.
        if (isTouchLikePointerType(event.pointerType)) {
          isPressedRef.current = false;
        }
      },
      onpointermove(event) {
        if (disabled || !isTouchLikePointerType(event.pointerType) || !isPressedRef.current) {
          return;
        }

        movesAfterTouchRef.current += 1;

        const { x, y } = downCoordsRef.current;
        const dx = x - event.clientX;
        const dy = y - event.clientY;

        if (dx ** 2 + dy ** 2 > scrollDistance ** 2) {
          stopAutoChange();
        }
      },
      onmouseenter(event) {
        if (
          event.defaultPrevented ||
          disabled ||
          !isPressedRef.current ||
          isTouchingButtonRef.current ||
          isTouchLikePointerType(pointerTypeRef.current)
        ) {
          return;
        }

        startAutoChange(event);
      },
      onmouseleave() {
        if (isTouchingButtonRef.current) {
          return;
        }

        stopAutoChange();
      },
      onmouseup() {
        if (isTouchingButtonRef.current) {
          return;
        }

        stopAutoChange();
      },
    };

    function shouldSkipClick(event: MouseEvent): boolean {
      if (event.defaultPrevented) {
        return true;
      }
      if (isTouchLikePointerType(pointerTypeRef.current)) {
        return ignoreClickRef.current;
      }
      return event.detail !== 0;
    }

    this.pointerHandlers = pointerHandlers;
    this.shouldSkipClick = shouldSkipClick;
  }
}
