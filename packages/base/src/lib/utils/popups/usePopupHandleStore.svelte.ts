// Native snapshot boundary for Base UI v1.8.0 usePopupHandleStore (MIT).
// The handle store pointer is a native $state.raw field; subscriptions remain public to imperative consumers.
import { onMount } from 'svelte';
import type { PopupHandleStoreProvider } from './popupHandle.svelte.js';
export function usePopupHandleStore<HandleStore>(getHandle: () => PopupHandleStoreProvider<HandleStore> | undefined) {
  let committed = $state(false);
  onMount(() => { committed = true; });
  return { get store() { const handle = getHandle(); return handle === undefined ? undefined : committed ? handle.store : handle.serverStore; } };
}
