<script lang="ts">
  import { applyPopupOpenChange } from '../../src/lib/utils/popups/popupStoreUtils.svelte.js';
  import { createStore, details } from './popup-open-change-store.js';
  const store = createStore();
  const open = $derived(store.useState('open'));
  let node: HTMLDivElement;
  export function change(nextOpen: boolean, reason: string) {
    applyPopupOpenChange(store, nextOpen, details(reason));
  }
  export function getNode() {
    return node;
  }
</script>

<div bind:this={node} data-open={String(open)} style:opacity={open ? 1 : 0}>Popup</div>
