<script lang="ts">
  // Actual Base UI v1.8.0 NumberFieldScrubArea business body (MIT).
  import { flushSync, onDestroy, untrack } from 'svelte';
  import { addEventListener } from '../../utils/addEventListener.js';
  import { mergeCleanups } from '../../utils/mergeCleanups.js';
  import { ownerWindow, ownerDocument } from '../../utils/owner.js';
  import { platform } from '../../utils/platform/index.js';
  import { useStableCallback } from '../../utils/useStableCallback.js';
  import { useTimeout } from '../../utils/useTimeout.js';
  import type { HTMLProps } from '../../internals/types.js';
  import { useNumberFieldRootContext } from '../root/NumberFieldRootContext.js';
  import { stateAttributesMapping } from '../utils/stateAttributesMapping.js';
  import { setNumberFieldScrubAreaContext } from './NumberFieldScrubAreaContext.js';
  import RenderElement from '../../internals/RenderElement.svelte';
  import { getViewportRect } from '../utils/getViewportRect.js';
  import { createGenericEventDetails } from '../../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../internals/reasons.js';
  import { getTarget } from '../../utils/shadowDom.js';
  import type { NumberFieldScrubAreaProps } from '../types.js';
  const SCRUB_AREA_STYLE = 'touch-action:none;-webkit-user-select:none;user-select:none';
  let { render, class: classProp, direction = 'horizontal', pixelSensitivity = 2, teleportDistance, style, children, ref = $bindable(), ...elementProps }: NumberFieldScrubAreaProps = $props();
  const context = useNumberFieldRootContext();
  const { setIsScrubbing: setRootScrubbing, inputRef, focusInput, incrementValue, allowInputSyncRef, getStepAmount, onValueCommitted, lastChangedValueRef, valueRef } = context;
  const scrubState = $derived(context.state);
  const { disabled, readOnly } = $derived(scrubState);
  const scrubAreaRef = $state<{ current: HTMLSpanElement | null }>({ current: null });
  const isScrubbingRef = { current: false };
  const didMoveRef = { current: false };
  const pointerDownTargetRef = { current: null as EventTarget | null };
  const scrubAreaCursorRef = { current: null as HTMLSpanElement | null };
  const virtualCursorCoords = { current: { x: 0, y: 0 } };
  const exitPointerLockTimeout = useTimeout();
  let isTouchInput = $state(false);
  let isPointerLockDenied = $state(false);
  let isScrubbing = $state(false);
  function updateCursorTransform(virtualCursor: HTMLSpanElement, x: number, y: number) {
    // Invert the visual viewport scale so the cursor matches the OS cursor, which doesn't
    // scale with the content on pinch-zoom.
    const scale = ownerWindow(virtualCursor).visualViewport?.scale ?? 1;
    virtualCursor.style.transform = `translate3d(${x}px,${y}px,0) scale(${1 / scale})`;
  }

  const onScrub = useStableCallback(({ movementX, movementY }: PointerEvent) => {
    const virtualCursor = scrubAreaCursorRef.current;
    const scrubAreaEl = scrubAreaRef.current;

    if (!virtualCursor || !scrubAreaEl) {
      return;
    }

    const rect = getViewportRect(teleportDistance, scrubAreaEl);

    const coords = virtualCursorCoords.current;

    // Wrap the cursor to the opposite edge when its center crosses a viewport bound.
    const wrap = (coord: number, halfSize: number, low: number, high: number) => {
      if (coord + halfSize < low) {
        return high - halfSize;
      }
      if (coord + halfSize > high) {
        return low - halfSize;
      }
      return coord;
    };

    const newCoords = {
      x: wrap(
        Math.round(coords.x + movementX),
        virtualCursor.offsetWidth / 2,
        rect.left,
        rect.right,
      ),
      y: wrap(
        Math.round(coords.y + movementY),
        virtualCursor.offsetHeight / 2,
        rect.top,
        rect.bottom,
      ),
    };

    virtualCursorCoords.current = newCoords;

    updateCursorTransform(virtualCursor, newCoords.x, newCoords.y);
  });

  const onScrubbingChange = useStableCallback(
    (scrubbingValue: boolean, { clientX, clientY }: PointerEvent) => {
      flushSync(() => {
        isScrubbing = scrubbingValue;
        setRootScrubbing(scrubbingValue);
      });

      const virtualCursor = scrubAreaCursorRef.current;
      if (!virtualCursor || !scrubbingValue) {
        return;
      }

      const initialCoords = {
        x: clientX - virtualCursor.offsetWidth / 2,
        y: clientY - virtualCursor.offsetHeight / 2,
      };

      virtualCursorCoords.current = initialCoords;

      updateCursorTransform(virtualCursor, initialCoords.x, initialCoords.y);
    },
  );

  $effect(() => {
    const enabled = inputRef.current && !disabled && !readOnly && isScrubbing;
    void direction; void pixelSensitivity;
    if (!enabled) return;
    return untrack(() => {
      let cumulativeDelta = 0;

      function handleScrubPointerUp(event: PointerEvent) {
        function handler() {
          try {
            ownerDocument(scrubAreaRef.current).exitPointerLock();
          } catch {
            // Ignore errors.
          } finally {
            isScrubbingRef.current = false;
            onScrubbingChange(false, event);
            onValueCommitted(
              lastChangedValueRef.current ?? valueRef.current,
              createGenericEventDetails(REASONS.scrub, event),
            );

            // Manually dispatch a click event if no movement happened, since
            // preventDefault on pointerdown prevents the browser click event.
            const pointerDownTarget = pointerDownTargetRef.current;
            const input = inputRef.current;
            if (!didMoveRef.current && pointerDownTarget != null && input) {
              pointerDownTarget.dispatchEvent(
                new (ownerWindow(input).MouseEvent)('click', {
                  bubbles: true,
                  cancelable: true,
                }),
              );
            }

            didMoveRef.current = false;
            pointerDownTargetRef.current = null;
          }
        }

        if (platform.engine.gecko) {
          // Firefox needs a small delay here when soft-clicking as the pointer
          // lock will not release otherwise.
          exitPointerLockTimeout.start(20, handler);
        } else {
          handler();
        }
      }

      function handleScrubPointerMove(event: PointerEvent) {
        // The effects below can tear down and re-run without unmounting (`<Activity>`), which
        // clears the ref while `isScrubbing` stays `true` and re-attaches this listener. The ref
        // is the source of truth for whether a pointer is actually down.
        if (!isScrubbingRef.current) {
          return;
        }

        // Prevent text selection.
        event.preventDefault();

        onScrub(event);

        const { movementX, movementY } = event;

        cumulativeDelta += direction === 'vertical' ? movementY : movementX;

        if (Math.abs(cumulativeDelta) >= pixelSensitivity) {
          cumulativeDelta = 0;
          didMoveRef.current = true;
          const dValue = direction === 'vertical' ? -movementY : movementX;
          const stepAmount = getStepAmount(event);
          const rawAmount = dValue * stepAmount;

          if (rawAmount !== 0) {
            allowInputSyncRef.current = true;
            incrementValue(Math.abs(rawAmount), {
              direction: rawAmount >= 0 ? 1 : -1,
              event,
              reason: REASONS.scrub,
            });
          }
        }
      }

      const win = ownerWindow(inputRef.current);
      const unsubscribe = mergeCleanups(
        addEventListener(win, 'pointerup', handleScrubPointerUp, true),
        addEventListener(win, 'pointermove', handleScrubPointerMove, true),
      );

      return () => {
        exitPointerLockTimeout.clear();
        unsubscribe();
      };
    });
  });
  // Source no-commit mid-scrub teardown.
  onDestroy(() => {
    if (isScrubbingRef.current) {
      isScrubbingRef.current = false;
      setRootScrubbing(false);
      try { ownerDocument(scrubAreaRef.current).exitPointerLock(); } catch { /* original ignored errors */ }
    }
  });
  $effect(() => {
    const element = scrubAreaRef.current;
    if (!element || disabled || readOnly) return;
      function handleTouchStart(event: TouchEvent) {
        if (event.touches.length === 1) {
          event.preventDefault();
        }
      }

      return addEventListener(element, 'touchstart', handleTouchStart, { passive: false });
  });
  const defaultProps: HTMLProps = {
    role: 'presentation',
    style: SCRUB_AREA_STYLE,
    async onpointerdown(event: PointerEvent) {
      if (event.defaultPrevented || readOnly || event.button || disabled) {
        return;
      }

      const isTouch = event.pointerType === 'touch';
      isTouchInput = isTouch;

      if (event.pointerType === 'mouse') {
        event.preventDefault();
        focusInput();
      }

      isScrubbingRef.current = true;
      didMoveRef.current = false;
      pointerDownTargetRef.current = getTarget(event);
      onScrubbingChange(true, event);

      // WebKit causes significant layout shift with the native message, so we can't use it.
      if (!isTouch && !platform.engine.webkit) {
        try {
          // Avoid non-deterministic errors in testing environments. This error sometimes
          // appears:
          // "The root document of this element is not valid for pointer lock."
          await ownerDocument(scrubAreaRef.current).body.requestPointerLock();
          isPointerLockDenied = false;
        } catch {
          isPointerLockDenied = true;
        } finally {
          // `onScrubbingChange` already wraps its state updates in `flushSync`, so re-emit the
          // scrubbing state directly (no extra nested `flushSync`) to reflect the resolved
          // pointer-lock result on the cursor.
          if (isScrubbingRef.current) {
            onScrubbingChange(true, event);
          }
        }
      }
    },
  };

  setNumberFieldScrubAreaContext({ get isScrubbing() { return isScrubbing; }, get isTouchInput() { return isTouchInput; }, get isPointerLockDenied() { return isPointerLockDenied; }, scrubAreaCursorRef });
</script>
<RenderElement tag="span" componentProps={{ render, class: classProp, style }} params={{ ref: [scrubAreaRef], state: scrubState, props: [defaultProps, elementProps], stateAttributesMapping }} bind:element={ref}>{@render children?.()}</RenderElement>
