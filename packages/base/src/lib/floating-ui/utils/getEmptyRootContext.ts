// Original Base UI 1.8.0 getEmptyRootContext at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md.
import { PopupTriggerMap } from '../../utils/popups/popupTriggerMap.svelte.js';
import { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import type { FloatingRootContext } from '../types.js';
export function getEmptyRootContext(): FloatingRootContext {
  return new FloatingRootStore({
    open: false,
    transitionStatus: undefined,
    floatingElement: null,
    referenceElement: null,
    triggerElements: new PopupTriggerMap(),
    floatingId: undefined,
    syncOnly: false,
    nested: false,
    onOpenChange: undefined,
  });
}
