import { onDestroy } from 'svelte';
// Ported business body from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT Copyright (c) 2019 Material-UI SAS; see THIRD_PARTY_NOTICES.md.
import { AnimationFrame } from '@sveltery/utils/useAnimationFrame';
import { Timeout } from '@sveltery/utils/useTimeout';
import type { ElementProps, FloatingContext, FloatingRootContext } from '../types.js';
import { getTarget, isTypeableElement } from '../utils/element.js';
import { isMouseLikePointerType, isVirtualPointerEvent } from '../utils/event.js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { REASONS } from '../../internals/reasons.js';

export interface UseClickProps {
  /**
   * Whether the Hook is enabled, including all internal Effects and event
   * handlers.
   * @default true
   */
  enabled?: boolean | undefined;
  /**
   * The type of event to use to determine a “click” with mouse input.
   * Keyboard clicks work as normal.
   * @default 'click'
   */
  event?: 'click' | 'mousedown' | 'mousedown-only' | undefined;
  /**
   * Whether to toggle the open state with repeated clicks.
   * @default true
   */
  toggle?: boolean | undefined;
  /**
   * Whether to ignore the logic for mouse input (for example, if `useHover()`
   * is also being used).
   * @default false
   */
  ignoreMouse?: boolean | undefined;
  /**
   * If already open from another event such as the `useHover()` Hook,
   * determines whether to keep the floating element open when clicking the
   * reference element for the first time.
   * @default true
   */
  stickIfOpen?: boolean | undefined;
  /**
   * Touch-only delay (ms) before opening. Useful to allow mobile viewport/keyboard to settle.
   * @default 0
   */
  touchOpenDelay?: number | undefined;
  /**
   * The reason for the click.
   * @default REASONS.triggerPress
   */
  reason?: typeof REASONS.triggerPress | typeof REASONS.inputPress | undefined;
}

/**
 * Opens or closes the floating element when clicking the reference element.
 * @see https://floating-ui.com/docs/useClick
 */
export function useClick(
  getContext: () => FloatingRootContext | FloatingContext,
  getProps: () => UseClickProps = () => ({}),
): ElementProps {
  const context = $derived(getContext());
  const enabled = $derived(getProps().enabled ?? true);

  const pointerTypeRef = {
    current: undefined as 'mouse' | 'pen' | 'touch' | 'virtual' | undefined,
  };
  const frame = new AnimationFrame();
  onDestroy(frame.cancel);
  const touchOpenTimeout = new Timeout();
  onDestroy(touchOpenTimeout.clear);

  // Native derived handler construction corresponds to Source useMemo. An
  // in-flight DOM callback retains its selected scalar options through a
  // composed event; Source store.select/dataRef reads remain live.
  const reference: ElementProps['reference'] = $derived.by(() => {
    const {
      event: eventOption = 'click',
      toggle = true,
      ignoreMouse = false,
      stickIfOpen = true,
      touchOpenDelay = 0,
      reason = REASONS.triggerPress,
    } = getProps();
    const selectedContext = context;
    const store = 'rootStore' in selectedContext ? selectedContext.rootStore : selectedContext;
    const dataRef = store.context.dataRef;

    function setOpenWithTouchDelay(
      nextOpen: boolean,
      nativeEvent: MouseEvent,
      target: HTMLElement,
      pointerType: 'mouse' | 'pen' | 'touch' | 'virtual' | undefined,
    ) {
      const details = createChangeEventDetails(reason, nativeEvent, target);

      if (nextOpen && pointerType === 'touch' && touchOpenDelay > 0) {
        touchOpenTimeout.start(touchOpenDelay, () => {
          store.setOpen(true, details);
        });
      } else {
        store.setOpen(nextOpen, details);
      }
    }

    function getNextOpen(
      open: boolean,
      currentTarget: EventTarget | null,
      isClickLikeOpenEvent: (eventType: string | undefined) => boolean,
    ) {
      const openEvent = dataRef.current.openEvent;
      const hasClickedOnInactiveTrigger = store.select('domReferenceElement') !== currentTarget;

      if (open && hasClickedOnInactiveTrigger) {
        // Moving between triggers should always open the newly active one.
        return true;
      }

      if (!open) {
        // A closed popup should open on the next press.
        return true;
      }

      if (!toggle) {
        // Non-toggle mode never closes on a repeated trigger press.
        return true;
      }

      if (openEvent && stickIfOpen) {
        // Preserve hover/focus-opened popups until the matching click-like event closes them.
        return !isClickLikeOpenEvent(openEvent.type);
      }

      // Otherwise, a repeated click toggles the popup closed.
      return false;
    }

    return {
      onpointerdown(event: PointerEvent) {
        // Screen reader activations (Android TalkBack, desktop screen readers) report a
        // mouse-like `pointerType`, but `ignoreMouse` must not drop them: hover logic cannot
        // open for a virtual press since there is no real pointer movement to wait for.
        // Virtual `touch` presses (iOS VoiceOver) keep their type so `touchOpenDelay` applies.
        pointerTypeRef.current =
          isMouseLikePointerType(event.pointerType, true) && isVirtualPointerEvent(event)
            ? 'virtual'
            : (event.pointerType as 'mouse' | 'pen' | 'touch');
      },
      onmousedown(event: MouseEvent) {
        const pointerType = pointerTypeRef.current;
        const nativeEvent = event;
        const open = store.select('open');

        // Ignore all buttons except for the "main" button.
        // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
        if (
          event.button !== 0 ||
          eventOption === 'click' ||
          (isMouseLikePointerType(pointerType, true) && ignoreMouse)
        ) {
          return;
        }

        const nextOpen = getNextOpen(
          open,
          event.currentTarget,
          (openEventType) => openEventType === 'click' || openEventType === 'mousedown',
        );

        // Animations sometimes won't run on a typeable element if using a rAF.
        // Focus is always set on these elements. For touch, we may delay opening.
        const target = getTarget(nativeEvent);

        if (isTypeableElement(target)) {
          setOpenWithTouchDelay(nextOpen, nativeEvent, target as HTMLElement, pointerType);
          return;
        }

        // capture the currentTarget before the rAF.
        // Native currentTarget is cleared after dispatch completes.
        const eventCurrentTarget = event.currentTarget as HTMLElement;

        // Wait until focus is set on the element. This is an alternative to
        // `event.preventDefault()` to avoid :focus-visible from appearing when using a pointer.
        frame.request(() => {
          setOpenWithTouchDelay(nextOpen, nativeEvent, eventCurrentTarget, pointerType);
        });
      },
      onclick(event: MouseEvent) {
        if (eventOption === 'mousedown-only') {
          return;
        }

        const pointerType = pointerTypeRef.current;

        if (eventOption === 'mousedown' && pointerType) {
          pointerTypeRef.current = undefined;
          return;
        }

        if (isMouseLikePointerType(pointerType, true) && ignoreMouse) {
          return;
        }

        const open = store.select('open');
        const nextOpen = getNextOpen(
          open,
          event.currentTarget,
          (openEventType) =>
            openEventType === 'click' ||
            openEventType === 'mousedown' ||
            openEventType === 'keydown' ||
            openEventType === 'keyup',
        );
        setOpenWithTouchDelay(nextOpen, event, event.currentTarget as HTMLElement, pointerType);
      },
      onkeydown() {
        pointerTypeRef.current = undefined;
      },
    };
  });

  return {
    get reference() {
      return enabled ? reference : undefined;
    },
  };
}
