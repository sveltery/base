// Original Base UI v1.8.0 useSyncedFloatingRootContext store synchronization business branches.
// Native Svelte live-reader/setup boundary; MIT: THIRD_PARTY_NOTICES.md.
import { untrack } from 'svelte';
import { isElement } from '@floating-ui/utils/dom';
import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
import { FloatingRootStore, type FloatingRootState } from '../components/FloatingRootStore.svelte.js';
import type { PopupStoreState, PopupTriggerDataStore } from '../../utils/popups/store.js';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
export function useSyncedFloatingRootContext<State extends PopupStoreState<unknown>>(options: {
  popupStore: PopupTriggerDataStore<State>; treatPopupAsFloatingElement?: boolean;
  floatingRootContext?: FloatingRootStore; floatingId: string | undefined; nested: boolean;
  onOpenChange(open: boolean, eventDetails: BaseUIChangeEventDetails<string>): void;
}) {
  const { popupStore, treatPopupAsFloatingElement = false, floatingRootContext: provided, floatingId, nested, onOpenChange } = options;
  const open = $derived(popupStore.select('open'));
  const referenceElement = $derived(popupStore.select('activeTriggerElement'));
  const floatingElement = $derived(popupStore.useState(treatPopupAsFloatingElement ? 'popupElement' : 'positionerElement'));
  const store = untrack(() => provided ?? new FloatingRootStore({ open, transitionStatus: undefined, referenceElement, floatingElement, triggerElements: popupStore.context.triggerElements, onOpenChange, floatingId, syncOnly: true, nested }));
  popupStore.set('floatingId', floatingId);
  useIsoLayoutEffect(() => {
    const valuesToSync = { open, floatingId, referenceElement, floatingElement } as Pick<FloatingRootState, 'open' | 'floatingId' | 'referenceElement' | 'floatingElement' | 'domReferenceElement' | 'positionReference'>;
    if (isElement(referenceElement)) valuesToSync.domReferenceElement = referenceElement;
    if (store.state.positionReference === store.state.referenceElement) valuesToSync.positionReference = referenceElement;
    store.update(valuesToSync);
  }, () => [open, floatingId, referenceElement, floatingElement, store]);
  store.context.onOpenChange = onOpenChange;
  store.context.nested = nested;
  return store;
}
