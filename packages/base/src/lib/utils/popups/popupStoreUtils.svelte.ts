// Business body from Base UI v1.8.0 popupStoreUtils.ts at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
import { flushSync, untrack } from 'svelte';
import type { PopupStoreState, PopupStoreContext } from './store.js';
import { EMPTY_OBJECT } from '@sveltery/utils/empty';
import { useFloatingParentNodeId } from '../../floating-ui/components/FloatingTree.svelte.js';
import { useSyncedFloatingRootContext } from '../../floating-ui/hooks/useSyncedFloatingRootContext.svelte.js';


import { useTransitionStatus } from '../../internals/useTransitionStatus.svelte.js';
import { useOpenChangeComplete } from '../../internals/useOpenChangeComplete.svelte.js';
import { createChangeEventDetails, type BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { REASONS } from '../../internals/reasons.js';
import type { InteractionType } from '@sveltery/utils/useEnhancedClickHandler';
import type { PopupTriggerDataStore } from './store.js';

type PopupStoreWithOpen<State extends PopupStoreState<unknown>> = PopupTriggerDataStore<State> & {
  setOpen(open: boolean, eventDetails: BaseUIChangeEventDetails<'none'>): void;
  useSyncedValues<const Key extends keyof State>(getValues: () => Pick<State, Key>): void;
};

type PopupOpenState = Pick<PopupStoreState<unknown>, 'open' | 'preventUnmountingOnClose' | 'activeTriggerId' | 'activeTriggerElement'>;
export function createPopupOpenState(state: PopupOpenState, open: boolean, trigger: Element | undefined, preventUnmountOnClose = false): PopupOpenState {
  let preventUnmountingOnClose = state.preventUnmountingOnClose;
  if (open) preventUnmountingOnClose = false;
  else if (preventUnmountOnClose) preventUnmountingOnClose = true;
  const triggerId = trigger?.id ?? null;
  let activeTriggerId = state.activeTriggerId;
  let activeTriggerElement = state.activeTriggerElement;
  if (triggerId || open) { activeTriggerId = triggerId; activeTriggerElement = trigger ?? null; }
  return { open, preventUnmountingOnClose, activeTriggerId, activeTriggerElement };
}
function syncTriggerCount(store: PopupTriggerDataStore<PopupStoreState<unknown>>) {
  const triggerCount = store.context.triggerElements.size;
  if (store.select('open') && store.state.triggerCount !== triggerCount) {
    store.set('triggerCount', triggerCount);
  }
}

/**
 * Returns a stable callback ref that registers/unregisters the trigger element in the store.
 *
 * Stable so a downstream ref merger that retains the callback it was first given still reaches the
 * trigger's current store. The registration is tracked as a `(store, id, element)` triple, so
 * unregistering targets the store the element was actually registered in.
 *
 * Since the callback never changes, the caller must re-run it from a layout effect keyed on
 * `[store, id]` to migrate an already-registered element. That effect is also what registers the
 * element in the first place when `id` only resolves after the first commit (React 17's `useId`
 * fallback), because the register call made while the id is still `undefined` does nothing.
 *
 * @param id Id of the trigger.
 * @param store The Store instance where the trigger should be registered.
 */
export function useTriggerRegistration<State extends PopupStoreState<unknown>>(
  getId: () => string | undefined,
  getStore: () => PopupTriggerDataStore<State>,
) {
  const registrationRef: { current: {
    store: PopupTriggerDataStore<State>;
    id: string;
    element: Element;
  } | null } = { current: null };

  return (element: Element | null) => {
    const id = getId();
    const store = getStore();
    const registration = registrationRef.current;

    if (registration !== null) {
      if (
        registration.element === element &&
        registration.store === store &&
        registration.id === id
      ) {
        // Already registered where it belongs, so the caller's migration effect is free on mount.
        return;
      }

      registrationRef.current = null;
      const registeredStore = registration.store;
      if (
        registeredStore.context.triggerElements.getById(registration.id) === registration.element
      ) {
        registeredStore.context.triggerElements.delete(registration.id);
        syncTriggerCount(registeredStore);
      }
    }

    if (element !== null && id !== undefined) {
      registrationRef.current = { store, id, element };
      store.context.triggerElements.add(id, element);
      syncTriggerCount(store);
    }
  };
}

export function useTriggerDataForwarding<
  State extends PopupStoreState<unknown>,
  const Key extends keyof Omit<State, 'activeTriggerId' | 'activeTriggerElement'>,
>(
  getTriggerId: () => string | undefined,
  triggerElementRef: { current: Element | null },
  getStore: () => PopupTriggerDataStore<State>,
  getStateUpdates: () => Pick<State, Key>,
) {
  const store = $derived(getStore());
  const triggerId = $derived(getTriggerId());
  const stateUpdates = $derived(getStateUpdates());
  const isMountedByThisTrigger = $derived(store.useState('isMountedByTrigger', triggerId));

  const baseRegisterTrigger = useTriggerRegistration(getTriggerId, getStore);

  // Applies trigger-owned state (active-trigger ownership and payload) when the trigger registers.
  // Stable so payload/`stateUpdates` changes do not change the ref identity (which would needlessly
  // churn registration); it reads the latest closure values when invoked.
  const applyTriggerData = (element: Element) => {
    const open = store.select('open');
    const activeTriggerId = store.select('activeTriggerId');

    if (activeTriggerId === triggerId) {
      const changes = {
        activeTriggerElement: element,
        ...(open ? stateUpdates : null),
      } as Pick<Readonly<State>, Key | 'activeTriggerElement'>;
      store.update(changes);
      return;
    }

    if (activeTriggerId == null && open) {
      // If a popup is already open, a detached trigger can mount before any active trigger
      // has been established. Claim the first registered trigger so trigger-owned focus
      // management and ARIA relationships work.
      const changes = {
        activeTriggerId: triggerId ?? null,
        activeTriggerElement: element,
        ...stateUpdates,
      } as Pick<Readonly<State>, Key | 'activeTriggerId' | 'activeTriggerElement'>;
      store.update(changes);
    }
  };

  // Stable, so the merged ref on the rendered element keeps its identity for the trigger's whole
  // lifetime.
  const registerTrigger = (element: Element | null) => {
    baseRegisterTrigger(element);
    if (element) {
      applyTriggerData(element);
    }
  };

  // A stable ref does not re-fire on a store or id change, so migrate here instead: unregister from
  // the previous store, then register the element the trigger still renders into the current one.
  $effect(() => {
    // Native identity reads own migration; registration publishes to the Store.
    void store;
    void triggerId;
    const element = triggerElementRef.current;
    untrack(() => registerTrigger(element));
    return () => registerTrigger(null);
  });

  $effect(() => {
    if (isMountedByThisTrigger) {
      const changes = {
        activeTriggerElement: triggerElementRef.current,
        ...stateUpdates,
      } as Pick<Readonly<State>, Key | 'activeTriggerElement'>;
      store.update(changes);
    }
  });

  return { registerTrigger, get isMountedByThisTrigger() { return isMountedByThisTrigger; } };
}

export function useImplicitActiveTrigger<State extends PopupStoreState<unknown>>(
  store: PopupStoreWithOpen<State>,
  options: {
    closeOnActiveTriggerUnmount?: boolean | undefined;
  } = {},
) {
  const { closeOnActiveTriggerUnmount = false } = options;
  // Distinguishes a trigger that unmounted from a new active trigger that has not hydrated yet.
  const resolvedActiveTriggerIdRef: { current: string | null } = { current: null };
  const open = $derived(store.useState('open'));
  const reactiveTriggerCount = $derived(store.useState('triggerCount'));
  // Subscribe to the active trigger id so the reconciliation below reruns when ownership moves to
  // another trigger while the popup stays open (e.g. a focus/hover handoff between triggers).
  const activeTriggerId = $derived(store.useState('activeTriggerId'));
  // Subscribe to the active trigger element so the reconciliation reruns when a pending active
  // trigger registers in a commit where the trigger count nets out unchanged (registration
  // forwards the element to the store when the registering trigger matches the active id).
  // Without this, the id would never be marked resolved and a later genuine unmount would be
  // misclassified as pending, disabling `closeOnActiveTriggerUnmount`.
  const reactiveActiveTriggerElement = $derived(store.useState('activeTriggerElement'));

  $effect(() => {
    if (!open) {
      resolvedActiveTriggerIdRef.current = null;
      if (store.state.triggerCount !== 0) {
        store.set('triggerCount', 0);
      }
      return;
    }

    const triggerCount = store.context.triggerElements.size;
    const stateUpdates = {} as Pick<
      State,
      'triggerCount' | 'activeTriggerId' | 'activeTriggerElement'
    >;

    if (store.state.triggerCount !== triggerCount) {
      stateUpdates.triggerCount = triggerCount;
    }

    const currentActiveTriggerId = store.select('activeTriggerId');
    let lostActiveTriggerId: string | null = null;

    if (currentActiveTriggerId) {
      const activeTriggerElement = store.context.triggerElements.getById(currentActiveTriggerId);
      if (!activeTriggerElement) {
        for (const [triggerId, triggerElement] of store.context.triggerElements.entries()) {
          if (triggerElement === store.state.activeTriggerElement) {
            stateUpdates.activeTriggerId = triggerId;
            stateUpdates.activeTriggerElement = triggerElement;
            resolvedActiveTriggerIdRef.current = triggerId;
            break;
          }
        }

        if (stateUpdates.activeTriggerId === undefined) {
          if (resolvedActiveTriggerIdRef.current === currentActiveTriggerId) {
            lostActiveTriggerId = currentActiveTriggerId;
          } else {
            resolvedActiveTriggerIdRef.current = null;
          }
        }
      } else {
        resolvedActiveTriggerIdRef.current = currentActiveTriggerId;
        if (activeTriggerElement !== store.state.activeTriggerElement) {
          stateUpdates.activeTriggerElement = activeTriggerElement;
        }
      }
    } else {
      resolvedActiveTriggerIdRef.current = null;
    }

    if (!lostActiveTriggerId && !currentActiveTriggerId && triggerCount === 1) {
      const iteratorResult = store.context.triggerElements.entries().next();
      if (!iteratorResult.done) {
        const [implicitTriggerId, implicitTriggerElement] = iteratorResult.value;
        stateUpdates.activeTriggerId = implicitTriggerId;
        stateUpdates.activeTriggerElement = implicitTriggerElement;
        resolvedActiveTriggerIdRef.current = implicitTriggerId;
      }
    }

    if (
      stateUpdates.triggerCount !== undefined ||
      stateUpdates.activeTriggerId !== undefined ||
      stateUpdates.activeTriggerElement !== undefined
    ) {
      store.update(stateUpdates);
    }

    if (lostActiveTriggerId) {
      if (closeOnActiveTriggerUnmount) {
        // Defer so a same-tick replacement trigger with the same id can register first.
        queueMicrotask(() => {
          if (
            store.select('open') &&
            store.select('activeTriggerId') === lostActiveTriggerId &&
            !store.context.triggerElements.getById(lostActiveTriggerId)
          ) {
            const eventDetails = createChangeEventDetails(REASONS.none);
            store.setOpen(false, eventDetails);
            // If closing is canceled, keep the previous active trigger ownership for the
            // still-open popup instead of claiming another trigger implicitly.
            if (!eventDetails.isCanceled) {
              store.update({
                activeTriggerId: null,
                activeTriggerElement: null,
              });
            }
          }
        });
      }
    }
  });
}


/** Source popup presence/ownership lifecycle; native canonical transition and completion owners. */
export function useOpenStateTransitions<State extends PopupStoreState<unknown>>(
  getOpen: () => boolean,
  store: PopupStoreWithOpen<State>,
  onUnmount?: () => void,
  animateInitialOpen?: boolean,
) {
  const transition = useTransitionStatus(getOpen, false, false, animateInitialOpen);
  const syncedPreventUnmountingOnClose = $derived(getOpen() ? false : store.select('preventUnmountingOnClose'));
  store.useSyncedValues(() => ({ mounted: transition.mounted, transitionStatus: transition.transitionStatus, preventUnmountingOnClose: syncedPreventUnmountingOnClose } as Pick<State, 'mounted' | 'transitionStatus' | 'preventUnmountingOnClose'>));
  const forceUnmount = () => {
    transition.setMounted(false);
    store.update({ activeTriggerId: null, activeTriggerElement: null, mounted: false, preventUnmountingOnClose: false } as Pick<State, 'activeTriggerId' | 'activeTriggerElement' | 'mounted' | 'preventUnmountingOnClose'>);
    onUnmount?.();
    store.context.onOpenChangeComplete?.(false);
  };
  useOpenChangeComplete({
    get enabled() { return transition.mounted && !getOpen() && !syncedPreventUnmountingOnClose; },
    get open() { return getOpen(); },
    ref: store.context.popupRef,
    onComplete() { if (!getOpen()) forceUnmount(); },
  });
  return { forceUnmount, get transitionStatus() { return transition.transitionStatus; } };
}

export function usePopupRootSync<State extends PopupStoreState<unknown> & { openMethod: InteractionType | null }>(store: PopupStoreWithOpen<State>, getOpen: () => boolean) {
  $effect(() => { if (!getOpen() && store.state.openMethod !== null) store.set('openMethod', null); });
  $effect(() => () => { if (store.state.openMethod !== null) store.set('openMethod', null); });
}

export function createDefaultInitialFocus(popupRef: { current: HTMLElement | null }) {
  return (interactionType: InteractionType) => interactionType === 'touch' ? popupRef.current : true;
}
export const FOCUSABLE_POPUP_PROPS = { tabindex: -1, 'data-base-ui-focusable': '' };

/** Native once-only Root ownership, with the actual shared floating-root state synchronization. */
export function usePopupRootStore<State extends PopupStoreState<unknown>, SetOpenEventDetails extends BaseUIChangeEventDetails<string>, Store extends PopupTriggerDataStore<State> & { setOpen(open: boolean, details: SetOpenEventDetails): void }>(
  createStore: (floatingId: string | undefined, nested: boolean) => Store,
  floatingId: string | undefined,
  treatPopupAsFloatingElement = false,
) {
  const nested = useFloatingParentNodeId() != null;
  const store = createStore(floatingId, nested);
  useSyncedFloatingRootContext({ popupStore: store, treatPopupAsFloatingElement, floatingRootContext: store.state.floatingRootContext, floatingId, nested, onOpenChange: store.setOpen as (open: boolean, details: BaseUIChangeEventDetails<string>) => void });
  return store;
}

/** Source interaction props are reset when the rendered interactions owner leaves. */
export function usePopupInteractionProps<State extends PopupStoreState<unknown>, const Key extends keyof State>(
  store: PopupStoreWithOpen<State>,
  getStatePart: () => Pick<State, Key | 'activeTriggerProps' | 'inactiveTriggerProps' | 'popupProps'>,
) {
  store.useSyncedValues(getStatePart);
  $effect(() => () => { store.update({ activeTriggerProps: EMPTY_OBJECT, inactiveTriggerProps: EMPTY_OBJECT, popupProps: EMPTY_OBJECT } as Pick<State, 'activeTriggerProps' | 'inactiveTriggerProps' | 'popupProps'>); });
}

export function attachPreventUnmountOnClose(eventDetails: { preventUnmountOnClose(): void }) {
  let preventUnmountOnClose = false;

  eventDetails.preventUnmountOnClose = () => {
    preventUnmountOnClose = true;
  };

  return () => preventUnmountOnClose;
}

/**
 * Runs the shared open-change sequence for a popup store: notifies `onOpenChange`,
 * honors cancellation, dispatches the floating root change, maps the reason to an
 * `instantType`, and commits the state update (synchronously for hover so
 * `getAnimations()` observes it). Stores supply their own differences via
 * `extraState` (e.g. the last change reason) and `onBeforeDispatch` (e.g. updating
 * inline-rect coordinates).
 */
export function applyPopupOpenChange<
  State extends PopupStoreState<unknown> & {
    instantType?: 'delay' | 'dismiss' | 'focus' | undefined;
  },
  EventDetails extends BaseUIChangeEventDetails<string>,
  ExtraKey extends keyof State = never,
>(
  store: {
    readonly context: Pick<PopupStoreContext<EventDetails>, 'onOpenChange'>;
    readonly state: State;
    update<const Key extends keyof State>(state: Pick<State, Key>): void;
  },
  nextOpen: boolean,
  eventDetails: EventDetails & { preventUnmountOnClose(): void },
  options: {
    onBeforeDispatch?: (() => void) | undefined;
    extraState?: Pick<State, ExtraKey> | undefined;
  } = {},
): void {
  const reason = eventDetails.reason;
  const isHover = reason === REASONS.triggerHover;
  const isFocusOpen = nextOpen && reason === REASONS.triggerFocus;
  const isDismissClose =
    !nextOpen && (reason === REASONS.triggerPress || reason === REASONS.escapeKey);

  const shouldPreventUnmountOnClose = attachPreventUnmountOnClose(eventDetails);

  store.context.onOpenChange?.(nextOpen, eventDetails);

  if (eventDetails.isCanceled) {
    return;
  }

  options.onBeforeDispatch?.();

  store.state.floatingRootContext.dispatchOpenChange(nextOpen, eventDetails);

  const changeState = () => {
    const popupOpenState = createPopupOpenState(
      store.state,
      nextOpen,
      eventDetails.trigger,
      shouldPreventUnmountOnClose(),
    );

    const updatedState = { ...options.extraState, ...popupOpenState } as Pick<
      State,
      keyof PopupOpenState | ExtraKey | 'instantType'
    >;

    if (isFocusOpen) {
      updatedState.instantType = 'focus';
    } else if (isDismissClose) {
      updatedState.instantType = 'dismiss';
    } else if (isHover) {
      updatedState.instantType = undefined;
    }

    store.update(updatedState);
  };

  if (isHover) {
    // Flush synchronously for hover so `node.getAnimations()` sees the new state.
    flushSync(changeState);
  } else {
    changeState();
  }
}
