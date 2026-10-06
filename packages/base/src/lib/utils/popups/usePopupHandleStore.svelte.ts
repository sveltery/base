// Native snapshot boundary for Base UI v1.8.0 usePopupHandleStore (MIT).
// The original plain store pointer is observed by native createSubscriber in the handle getter.
// onMount chooses the committed pointer after the source-compatible inert server snapshot.
import { onMount } from 'svelte';
import type { PopupHandleStoreProvider } from './popupHandle.svelte.js';
export class PopupHandleStore<HandleStore> {
  private committed = $state(false);

  constructor(private readonly getHandle: () => PopupHandleStoreProvider<HandleStore> | undefined) {
    onMount(() => {
      this.committed = true;
    });
  }

  get store() {
    const handle = this.getHandle();
    return handle === undefined ? undefined : this.committed ? handle.store : handle.serverStore;
  }
}

export function usePopupHandleStore<HandleStore>(
  getHandle: () => PopupHandleStoreProvider<HandleStore> | undefined,
) {
  return new PopupHandleStore(getHandle);
}
