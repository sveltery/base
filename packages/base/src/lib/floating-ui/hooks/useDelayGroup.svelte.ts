// Original Base UI 1.8.0 useDelayGroup/resetDelayRef business, native live state.
// MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
import { untrack } from 'svelte';
import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
import { useFloatingDelayGroupContext } from '../components/FloatingDelayGroupContext.js';
import { getDelay } from './useHoverShared.js';
import type { FloatingRootContext, Delay, FloatingContext } from '../types.js';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { REASONS } from '../../internals/reasons.js';

function resetDelayRef(delayRef: { current: Delay }, initialDelayRef: { current: Delay }) {
  delayRef.current = initialDelayRef.current;
}

export interface UseDelayGroupOptions {
  /** Whether this consumer's trigger has opened the tooltip. */
  open: boolean;
}

export interface UseDelayGroupReturn {
  activeIdRef: { current: string | null | undefined };
  delayRef: { current: Delay };
  readonly isInstantPhase: boolean;
  readonly hasProvider: boolean;
}

export function useDelayGroup(
  getContext: () => FloatingRootContext | FloatingContext,
  getOptions: () => UseDelayGroupOptions = () => ({ open: false }),
): UseDelayGroupReturn {
  const context = $derived(getContext());
  const { open } = $derived(getOptions());

  const store = $derived('rootStore' in context ? context.rootStore : context);
  const floatingId = $derived(store.useState('floatingId'));

  const groupContext = useFloatingDelayGroupContext();
  const { currentIdRef, delayRef, initialDelayRef, currentContextRef, hasProvider, timeout } =
    groupContext;
  const timeoutMs = $derived(groupContext.timeoutMs);

  let isInstantPhase = $state(false);
  const setIsInstantPhase = (value: boolean) => {
    isInstantPhase = value;
  };
  const openRef = { current: untrack(() => open) };

  // Native effects dispose and register per effect. Release the old Source owner
  // before syncing new open state or registering takeover, as Original cleanup does.
  useIsoLayoutEffect(
    () => {
      const ownedId = floatingId;
      return () => {
        if (currentIdRef.current === ownedId) {
          currentContextRef.current = null;

          if (!openRef.current) {
            return;
          }

          currentIdRef.current = null;
          resetDelayRef(delayRef, initialDelayRef);
          timeout.clear();
        }
      };
    },
    () => [currentContextRef, currentIdRef, delayRef, floatingId, initialDelayRef, timeout],
  );

  useIsoLayoutEffect(
    () => {
      openRef.current = open;
    },
    () => [open],
  );

  useIsoLayoutEffect(
    () => {
      function unset() {
        currentContextRef.current?.setIsInstantPhase(false);
        currentIdRef.current = null;
        currentContextRef.current = null;
        delayRef.current = initialDelayRef.current;
        timeout.clear();
      }

      if (!currentIdRef.current) {
        return undefined;
      }

      if (!open && currentIdRef.current === floatingId) {
        setIsInstantPhase(false);

        if (timeoutMs) {
          const closingId = floatingId;
          const closingStore = store;
          timeout.start(timeoutMs, () => {
            // If another tooltip has taken over the group, skip resetting.
            if (
              closingStore.select('open') ||
              (currentIdRef.current && currentIdRef.current !== closingId)
            ) {
              return;
            }
            unset();
          });
          return () => {
            if (openRef.current || currentIdRef.current !== closingId) {
              timeout.clear();
            }
          };
        }

        unset();
      }

      return undefined;
    },
    () => [
      open,
      floatingId,
      currentIdRef,
      delayRef,
      timeoutMs,
      initialDelayRef,
      currentContextRef,
      timeout,
      store,
    ],
  );

  useIsoLayoutEffect(
    () => {
      if (!open) {
        return;
      }

      const prevContext = currentContextRef.current;
      const prevId = currentIdRef.current;

      // A new tooltip is opening, so cancel any pending timeout that would reset
      // the group's delay back to the initial value.
      timeout.clear();
      currentContextRef.current = { onOpenChange: store.setOpen, setIsInstantPhase };
      currentIdRef.current = floatingId;
      delayRef.current = {
        open: 0,
        close: getDelay(initialDelayRef.current, 'close'),
      };

      if (prevId !== null && prevId !== floatingId) {
        setIsInstantPhase(true);
        prevContext?.setIsInstantPhase(true);
        prevContext?.onOpenChange(false, createChangeEventDetails(REASONS.none));
      } else {
        setIsInstantPhase(false);
        prevContext?.setIsInstantPhase(false);
      }
    },
    () => [
      open,
      floatingId,
      store,
      currentIdRef,
      delayRef,
      initialDelayRef,
      currentContextRef,
      timeout,
    ],
  );

  return {
    activeIdRef: currentIdRef,
    hasProvider,
    delayRef,
    get isInstantPhase() {
      return isInstantPhase;
    },
  };
}
