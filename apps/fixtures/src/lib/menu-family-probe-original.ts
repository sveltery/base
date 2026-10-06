// Actual pinned Base UI 1.8.0 runtime for authored paired regressions; no library runtime dependency.
import * as React from 'react';
import {
  FloatingRootStore,
  type FloatingRootStoreContext,
} from '../../node_modules/@base-ui/react/floating-ui-react/components/FloatingRootStore.js';
import { PopupTriggerMap } from '../../node_modules/@base-ui/react/utils/popups/popupTriggerMap.js';
export { React };
export { createRoot } from 'react-dom/client';
export { flushSync } from 'react-dom';
export { Menu } from '@base-ui/react/menu';
export { FloatingRootStore as OriginalStore } from '../../node_modules/@base-ui/react/floating-ui-react/components/FloatingRootStore.js';
export { PopupTriggerMap as OriginalMap } from '../../node_modules/@base-ui/react/utils/popups/popupTriggerMap.js';
export {
  HoverInteraction as OriginalHover,
  useHoverInteractionSharedState as originalHook,
} from '../../node_modules/@base-ui/react/floating-ui-react/hooks/useHoverInteractionSharedState.js';
export { useHoverReferenceInteraction as originalReferenceHook } from '../../node_modules/@base-ui/react/floating-ui-react/hooks/useHoverReferenceInteraction.js';

// Private Original inspection only: the context is declared by this pinned module,
// but its inherited ReactStore declaration is not resolved by the native package's
// separate TypeScript program. This returns the actual Original store unchanged.
export function createOriginalHoverProbeStore() {
  const store = new FloatingRootStore({
    open: false,
    transitionStatus: undefined,
    referenceElement: null,
    floatingElement: null,
    triggerElements: new PopupTriggerMap(),
    floatingId: undefined,
    syncOnly: true,
    nested: false,
    onOpenChange: undefined,
  });
  return store as FloatingRootStore & { readonly context: FloatingRootStoreContext };
}

// MenuHandle intentionally hides its store in the public Original declaration.
// The paired handoff witness inspects the actual pinned runtime's private field.
export function originalMenuPointerType(handle: unknown) {
  const actual = handle as {
    store: {
      select(key: 'floatingRootContext'): {
        context: {
          dataRef: { current: { hoverInteractionState?: { pointerType: string | undefined } } };
        };
      };
    };
  };
  return actual.store.select('floatingRootContext').context.dataRef.current.hoverInteractionState
    ?.pointerType;
}
