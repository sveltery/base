<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import * as Dialog from '../../src/lib/dialog/index.js';
  import type { Actions, ChangeEventDetails } from '../../src/lib/dialog/types.js';
  let { log, controlled = false, initial = false, keep = false, cancel = '', nested = false, prevent = false, custom = false, preventKey = false, preventClose = false }: { log: (channel: string, open?: boolean, details?: ChangeEventDetails) => void; controlled?: boolean; initial?: boolean; keep?: boolean; cancel?: string; nested?: boolean; prevent?: boolean; custom?: boolean; preventKey?: boolean; preventClose?: boolean } = $props();
  let owner = $state(untrack(() => initial));
  let visible = $state(true);
  let label = $state(true);
  let labelId = $state<string | undefined>(undefined);
  let actions = $state<Actions | null>(null);
  export function setOpen(value: boolean) { owner = value; }
  export function remove() { visible = false; }
  export function labelChange(value?: string) { labelId = value; }
  export function removeLabel() { label = false; }
  export function close() { actions?.close(); }
  export function unmountPopup() { actions?.unmount(); }
</script>
  {#snippet customTrigger(props: Record<string | symbol, unknown>, state: { disabled: boolean; open?: boolean }, children: Snippet | undefined)}<span {...props} data-custom-open={state.open}>{@render children?.()}</span>{/snippet}
{#if visible}
<Dialog.Root open={controlled ? owner : undefined} defaultOpen={initial} bind:actions onOpenChange={(open, details) => { log('consumer', open, details); if (cancel === (open ? 'open' : 'close')) details.cancel(); if (cancel === 'defer' && !open) details.preventUnmountOnClose(); }} onInternalOpenChange={(open, details) => log('internal', open, details)} onOpenChangeComplete={open => log('complete', open)}>
  <Dialog.Trigger id="opener" nativeButton={!custom} render={custom ? customTrigger : undefined} onclick={event => { log('click'); if (prevent) event.preventBaseUIHandler(); }} onkeydown={event => { if (preventKey) event.preventDefault(); }}>Open</Dialog.Trigger>
  <Dialog.Portal keepMounted={keep}>
    <Dialog.Backdrop data-testid="backdrop"/>
    <Dialog.Popup>
      {#if label}<Dialog.Title id={labelId}>Title</Dialog.Title>{/if}
      <Dialog.Description>Description</Dialog.Description>
      {#if nested}<Dialog.Root><Dialog.Trigger id="child-opener">Child open</Dialog.Trigger><Dialog.Portal><Dialog.Popup data-testid="child"><Dialog.Close id="child-close">Child close</Dialog.Close></Dialog.Popup></Dialog.Portal></Dialog.Root>{/if}
      <Dialog.Close id="closer" onclick={preventClose ? event => { log('close-click'); event.preventBaseUIHandler(); } : undefined}>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
{/if}
