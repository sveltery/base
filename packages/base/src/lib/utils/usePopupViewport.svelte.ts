// Original usePopupViewport complete captured DOM/content-key/transition business (MIT).
import { onDestroy, flushSync, untrack, type Snippet } from 'svelte';
import { AnimationFrame } from '@sveltery/utils/useAnimationFrame';
import { PreviousValue } from '@sveltery/utils/PreviousValue';

import { ownerDocument } from '@sveltery/utils/owner';
import { useAnimationsFinished } from '../internals/useAnimationsFinished.js';
import { usePopupAutoResize } from './usePopupAutoResize.svelte.js';
import type { Dimensions, Middleware } from '@floating-ui/dom';
import type { Side } from '../internals/anchor-positioning/types.js';
import { useDirection } from '../direction-provider/context.js';
import { adaptiveOrigin } from '../internals/anchor-positioning/adaptive-origin.js';
import * as CommonViewportDataAttributes from './CommonViewportDataAttributes.js';
// Original shared Pick<ReactStore, 'useState' | 'set'> capability, expressed without
// coupling this canonical shared business helper to one component's popup store.
interface PopupViewportStore {
  useState(key: 'activeTriggerElement'): Element | null;
  useState(key: 'activeTriggerId'): string | null;
  useState(key: 'open'): boolean;
  useState(key: 'payload'): unknown;
  useState(key: 'mounted'): boolean;
  useState(key: 'popupElement'): HTMLElement | null;
  useState(key: 'positionerElement'): HTMLElement | null;
  set(key: 'adaptiveOrigin', value: Middleware | undefined): void;
}
export const popupViewportStateMapping = {
  activationDirection: (value: string | undefined) =>
    value ? { [CommonViewportDataAttributes.activationDirection]: value } : null,
};
export interface PopupViewportState {
  activationDirection: string | undefined;
  transitioning: boolean;
}
export function usePopupViewport(
  getParameters: () => {
    store: PopupViewportStore;
    side: Side;
    children?: Snippet | undefined;
  },
) {
  const { store, side, children } = $derived(getParameters());
  const direction = useDirection();
  const activeTrigger = $derived(store.useState('activeTriggerElement'));
  const activeTriggerId = $derived(store.useState('activeTriggerId'));
  const open = $derived(store.useState('open'));
  const payload = $derived(store.useState('payload'));
  const mounted = $derived(store.useState('mounted'));
  const popupElement = $derived(store.useState('popupElement'));
  const positionerElement = $derived(store.useState('positionerElement'));
  const previousActiveTrigger = new PreviousValue(() => (open ? activeTrigger : null));
  // Remount current content on trigger changes (and once more when payload lags) to avoid DOM reuse flashes.
  // The key bumps immediately on trigger switches, then again if the payload arrives on a later render.
  const currentContentKey = usePopupContentKey(
    () => activeTriggerId,
    () => payload,
  );
  const capturedNodeRef = { current: null as HTMLElement | null };
  let previousContentNode = $state.raw<HTMLElement | null>(null);
  let newTriggerOffset = $state.raw<Offset | null>(null);
  let currentContainerElement = $state.raw<HTMLDivElement | null>(null);
  const currentContainerRef = {
    get current() {
      return currentContainerElement;
    },
  };
  let previousContainerElement = $state.raw<HTMLDivElement | null>(null);
  const previousContainerRef = {
    get current() {
      return previousContainerElement;
    },
  };
  const onAnimationsFinished = useAnimationsFinished(currentContainerRef, () => true);
  const cleanupFrame = new AnimationFrame();
  onDestroy(cleanupFrame.cancel);
  const cleanupControllerRef = { current: null as AbortController | null };
  let previousContentDimensions = $state.raw<Dimensions | null>(null);
  let showStartingStyleAttribute = $state.raw<boolean>(false);
  $effect(() => {
    store.set('adaptiveOrigin', adaptiveOrigin);
    return () => {
      store.set('adaptiveOrigin', undefined);
    };
  });
  const handleMeasureLayout = () => {
    currentContainerRef.current?.style.setProperty('animation', 'none');
    currentContainerRef.current?.style.setProperty('transition', 'none');
    previousContainerRef.current?.style.setProperty('display', 'none');
  };
  const handleMeasureLayoutComplete = (previousDimensions: Dimensions | null) => {
    currentContainerRef.current?.style.removeProperty('animation');
    currentContainerRef.current?.style.removeProperty('transition');
    previousContainerRef.current?.style.removeProperty('display');
    if (previousDimensions) {
      previousContentDimensions = previousDimensions;
    }
  };
  const armViewportCleanup = () => {
    cleanupControllerRef.current?.abort();
    const controller = new AbortController();
    cleanupControllerRef.current = controller;
    onAnimationsFinished(() => {
      previousContentNode = null;
      previousContentDimensions = null;
      capturedNodeRef.current = null;
    }, controller.signal);
  };
  const lastHandledTriggerRef = { current: null as Element | null };
  $effect(() => {
    if (!open || !mounted) {
      lastHandledTriggerRef.current = null;
    }
  });
  $effect(() => {
    // When a trigger changes, set the captured children HTML to state,
    // so we can render both new and old content.
    if (
      activeTrigger &&
      previousActiveTrigger.value &&
      activeTrigger !== previousActiveTrigger.value &&
      lastHandledTriggerRef.current !== activeTrigger &&
      capturedNodeRef.current
    ) {
      previousContentNode = capturedNodeRef.current;
      showStartingStyleAttribute = true;
      // Calculate the relative position between the previous and new trigger,
      // so we can pass it to the style hook for animation purposes.
      const offset = calculateRelativePosition(previousActiveTrigger.value!, activeTrigger);
      newTriggerOffset = offset;
      lastHandledTriggerRef.current = activeTrigger;
    }
  });
  // Arm cleanup after a trigger change, and re-arm it if the current container remounts
  // mid-transition when a lagging payload bumps `currentContentKey`. The remount discards
  // the running entry animation (and with transition-style CSS the replacement mounts at
  // final styles with no animation at all), so re-run the starting-style choreography —
  // otherwise the watcher either strands or fires before the previous container's exit
  // animation finishes.
  $effect(() => {
    // A content remount cancels the old animation and needs a fresh watcher.
    void currentContentKey();
    void currentContainerRef.current;
    if (previousContentNode == null) {
      return;
    }
    // Abort the stale watcher synchronously. The remount cancels the old container's
    // animations, and the resulting promise rejection would otherwise run the cleanup
    // in a microtask before the re-armed watcher below is in place.
    cleanupControllerRef.current?.abort();
    showStartingStyleAttribute = true;
    cleanupFrame.request(() => {
      flushSync(() => {
        showStartingStyleAttribute = false;
      });
      armViewportCleanup();
    });
  });
  // Capture a clone of the current content DOM subtree when not transitioning.
  // We can't store previous React nodes as they may be stateful; instead we capture DOM clones for visual continuity.
  $effect(() => {
    // When a transition is in progress, we store the next content in capturedNodeRef.
    // This handles the case where the trigger changes multiple times before the transition finishes.
    // We want to always capture the latest content for the previous snapshot.
    // So clicking quickly on T1, T2, T3 will result in the following sequence:
    // 1. T1 -> T2: previousContent = T1, currentContent = T2
    // 2. T2 -> T3: previousContent = T2, currentContent = T3
    void currentContentKey();
    void payload;
    void children;
    const source = currentContainerRef.current;
    if (!source) {
      return;
    }
    const wrapper = ownerDocument(source).createElement('div');
    for (const child of Array.from(source.childNodes)) {
      wrapper.appendChild(child.cloneNode(true));
    }
    capturedNodeRef.current = wrapper;
  });
  // Observe the actual native attachment as well as the Source content state: attachments
  // commit the new host after the content-state effect has created its markup.
  // When previousContentNode is present, imperatively populate the previous container with the cloned children.
  $effect(() => {
    const container = previousContainerRef.current;
    if (!container || !previousContentNode) {
      return;
    }
    container.replaceChildren(...Array.from(previousContentNode.childNodes));
  });
  usePopupAutoResize(() => ({
    popupElement,
    positionerElement,
    mounted,
    content: payload,
    onMeasureLayout: handleMeasureLayout,
    onMeasureLayoutComplete: handleMeasureLayoutComplete,
    side,
    direction: direction(),
  }));
  const state: PopupViewportState = $derived({
    activationDirection: getActivationDirection(newTriggerOffset),
    transitioning: previousContentNode != null,
  });
  return {
    get state() {
      return state;
    },
    get currentContentKey() {
      return currentContentKey();
    },
    get previousContentNode() {
      return previousContentNode;
    },
    get previousContentDimensions() {
      return previousContentDimensions;
    },
    get showStartingStyleAttribute() {
      return showStartingStyleAttribute;
    },
    setCurrentContainer(node: HTMLDivElement | null) {
      currentContainerElement = node;
    },
    setPreviousContainer(node: HTMLDivElement | null) {
      previousContainerElement = node;
    },
  };
}
type Offset = {
  horizontal: number;
  vertical: number;
};
/**
 * Returns a string describing the provided offset.
 * It describes both the horizontal and vertical offset, separated by a space.
 *
 * @param offset
 */
function getActivationDirection(offset: Offset | null): string | undefined {
  if (!offset) {
    return undefined;
  }
  return `${getValueWithTolerance(offset.horizontal, 5, 'right', 'left')} ${getValueWithTolerance(offset.vertical, 5, 'down', 'up')}`;
}
/**
 * Returns a label describing the value (positive/negative) treating values
 * within tolerance as zero.
 *
 * @param value Value to check
 * @param tolerance Tolerance to treat the value as zero.
 * @param positiveLabel
 * @param negativeLabel
 * @returns If 0 < abs(value) < tolerance, returns an empty string. Otherwise returns positiveLabel or negativeLabel.
 */
function getValueWithTolerance(
  value: number,
  tolerance: number,
  positiveLabel: string,
  negativeLabel: string,
) {
  if (value > tolerance) {
    return positiveLabel;
  }
  if (value < -tolerance) {
    return negativeLabel;
  }
  return '';
}
/**
 * Calculates the relative position between centers of two elements.
 */
function calculateRelativePosition(from: Element, to: Element): Offset {
  const fromRect = from.getBoundingClientRect();
  const toRect = to.getBoundingClientRect();
  const fromCenter = {
    x: fromRect.left + fromRect.width / 2,
    y: fromRect.top + fromRect.height / 2,
  };
  const toCenter = {
    x: toRect.left + toRect.width / 2,
    y: toRect.top + toRect.height / 2,
  };
  return {
    horizontal: toCenter.x - fromCenter.x,
    vertical: toCenter.y - fromCenter.y,
  };
}
/**
 * Returns a key that forces remounting content when triggers change or a payload is updated.
 */
function usePopupContentKey(
  getActiveTriggerId: () => string | null,
  getPayload: () => unknown,
): () => string {
  const activeTriggerId = $derived(getActiveTriggerId());
  const payload = $derived(getPayload());
  let contentKey = $state(0);
  const previousActiveTriggerIdRef = { current: untrack(() => activeTriggerId) };
  const previousPayloadRef = { current: untrack(() => payload) };
  const pendingPayloadUpdateRef = { current: false };
  $effect(() => {
    // Compare against the last committed values to decide whether we need a new DOM subtree.
    const previousActiveTriggerId = previousActiveTriggerIdRef.current;
    const previousPayload = previousPayloadRef.current;
    const triggerIdChanged = activeTriggerId !== previousActiveTriggerId;
    const payloadChanged = payload !== previousPayload;
    if (triggerIdChanged) {
      // Remount immediately on trigger change; remember if payload hasn't caught up yet.
      contentKey += 1;
      pendingPayloadUpdateRef.current = !payloadChanged;
    } else if (pendingPayloadUpdateRef.current && payloadChanged) {
      // Payload arrived a render later, so remount once more to avoid reusing the old <img>.
      contentKey += 1;
      pendingPayloadUpdateRef.current = false;
    }
    // Persist current values for the next render's comparison.
    previousActiveTriggerIdRef.current = activeTriggerId;
    previousPayloadRef.current = payload;
  });
  return () => `${activeTriggerId ?? 'current'}-${contentKey}`;
}
