// Original Base UI 1.8.0 useFloatingRootContext at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md. Component-owned native IDs and live getters replace React hooks.
import { untrack } from 'svelte';
import { DEV } from 'esm-env';
import { isElement } from '@floating-ui/utils/dom';
import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
import { PopupTriggerMap } from '../../utils/popups/popupTriggerMap.svelte.js';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
import { useFloatingParentNodeId } from '../components/FloatingTree.svelte.js';
import { FloatingRootStore, type FloatingRootState } from '../components/FloatingRootStore.svelte.js';
import type { ReferenceType } from '../types.js';

export interface UseFloatingRootContextOptions {
  open?: boolean | undefined;
  onOpenChange?(open: boolean, eventDetails: BaseUIChangeEventDetails<string>): void;
  elements?: { reference?: ReferenceType | null | undefined; floating?: HTMLElement | null | undefined } | undefined;
}

export function useFloatingRootContext(getOptions: () => UseFloatingRootContextOptions, floatingId: string): FloatingRootStore {
  const options = $derived(getOptions());
  const nested = useFloatingParentNodeId() != null;
  const store = untrack(() => new FloatingRootStore({
    open: options.open ?? false,
    transitionStatus: undefined,
    onOpenChange: options.onOpenChange,
    referenceElement: options.elements?.reference ?? null,
    floatingElement: options.elements?.floating ?? null,
    triggerElements: new PopupTriggerMap(),
    floatingId,
    syncOnly: false,
    nested,
  }));
  useIsoLayoutEffect(() => {
    const elements = options.elements ?? {};
    if (DEV && elements.reference && !isElement(elements.reference)) {
      console.error('Cannot pass a virtual element to the `elements.reference` option,', 'as it must be a real DOM element. Use `context.setPositionReference()`', 'instead.');
    }
    const valuesToSync = { open: options.open ?? false, floatingId } as Pick<FloatingRootState, 'open' | 'floatingId' | 'referenceElement' | 'domReferenceElement' | 'floatingElement'>;
    if (elements.reference !== undefined) {
      valuesToSync.referenceElement = elements.reference;
      valuesToSync.domReferenceElement = isElement(elements.reference) ? elements.reference : null;
    }
    if (elements.floating !== undefined) valuesToSync.floatingElement = elements.floating;
    store.update(valuesToSync);
  }, () => [options.open ?? false, floatingId, options.elements?.reference, options.elements?.floating]);
  // The callback reads the native owner live, including controlled updates.
  store.context.onOpenChange = (open, details) => options.onOpenChange?.(open, details);
  store.context.nested = nested;
  return store;
}
