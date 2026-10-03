// Native snapshot boundary for Base UI v1.8.0 usePopupHandleStore (MIT).
// The original plain store pointer is observed by native createSubscriber in the handle getter.
// onMount chooses the committed pointer after the source-compatible inert server snapshot.
import { onMount } from 'svelte';
import type { PopupHandleStoreProvider } from './popupHandle.svelte.js';
export function usePopupHandleStore<HandleStore>(getHandle: () => PopupHandleStoreProvider<HandleStore> | undefined) {
  let committed = $state(false);
  onMount(() => { committed = true; });
  return { get store() { const handle = getHandle(); return handle === undefined ? undefined : committed ? handle.store : handle.serverStore; } };
}
