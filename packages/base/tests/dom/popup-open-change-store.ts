import { SvelteStore } from '../../src/lib/utils/store/SvelteStore.svelte.js';
import { PopupTriggerMap } from '../../src/lib/utils/popups/popupTriggerMap.svelte.js';
import {
  createInitialPopupStoreState,
  popupStoreSelectors,
  type PopupStoreState,
  type PopupStoreContext,
} from '../../src/lib/utils/popups/store.js';
import {
  createChangeEventDetails,
  type BaseUIChangeEventDetails,
} from '../../src/lib/internals/createBaseUIEventDetails.js';

export type TestState = PopupStoreState<unknown> & {
  instantType: 'delay' | 'dismiss' | 'focus' | undefined;
  lastReason: string;
};
export type TestDetails = BaseUIChangeEventDetails<string, { preventUnmountOnClose(): void }>;
export function createStore() {
  const triggers = new PopupTriggerMap();
  return new SvelteStore<
    Readonly<TestState>,
    PopupStoreContext<TestDetails>,
    typeof popupStoreSelectors
  >(
    {
      ...createInitialPopupStoreState<unknown>(triggers, 'native-popup'),
      instantType: 'delay',
      lastReason: 'initial',
    },
    { triggerElements: triggers, popupRef: { current: null }, onOpenChangeComplete: undefined },
    popupStoreSelectors,
  );
}
export function details(reason: string, event?: Event, trigger?: Element) {
  return createChangeEventDetails(reason, event, trigger, { preventUnmountOnClose() {} });
}
