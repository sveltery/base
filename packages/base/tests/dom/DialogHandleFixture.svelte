<script lang="ts">
  import * as Dialog from '../../src/lib/dialog/index.js';
  import { createDialogHandle, type DialogHandle } from '../../src/lib/dialog/handle.svelte.js';
  import type { Actions, ChangeEventDetails } from '../../src/lib/dialog/types.js';
  import MountAction from './DialogHandleMount.svelte';
  import { untrack } from 'svelte';
  let { handle, second = createDialogHandle<number>(), initial = false, mountAction, sameCommit = false, cancel = false, controlled = false, onChange }: {
    handle: DialogHandle<number>; second?: DialogHandle<number>; initial?: boolean; mountAction?: 'open' | 'payload' | 'close'; sameCommit?: boolean; cancel?: boolean; controlled?: boolean; onChange?: (open: boolean, details: ChangeEventDetails) => void;
  } = $props();
  let current = $state(untrack(() => handle));
  let attached = $state(true);
  let mounted = $state(true);
  let payload = $state(1);
  let open = $state(false);
  let triggerId = $state<string | null>(null);
  let actions = $state<Actions | null>(null);
  export function forceUnmount() { actions?.unmount(); }
  export function swap() { current = current === handle ? second : handle; }
  export function toggle() { attached = !attached; }
  export function remove() { mounted = false; }
  export function remount() { mounted = true; }
  export function updatePayload(value: number) { payload = value; }
  export function openSecond() { triggerId = 'other'; open = true; }
</script>
{#if !mountAction}
  <Dialog.Trigger handle={current} id="other" payload={9}>Other</Dialog.Trigger>
  <Dialog.Trigger handle={current} id="trigger" {payload}>Trigger</Dialog.Trigger>
{/if}
<button type="button" onclick={() => { triggerId = 'other'; open = true; }}>Open programmatically</button>
{#if mounted}
  <Dialog.Root handle={attached ? current : undefined} defaultOpen={initial} open={controlled ? open : undefined} triggerId={controlled ? triggerId : undefined} modal={false} disablePointerDismissal bind:actions onOpenChange={(value, details) => { onChange?.(value, details); if (cancel) details.cancel(); if (controlled) open = value; }}>
    {#snippet children(state)}
      <span data-testid="payload">{state.payload ?? 'No payload'}</span>
      {#if mountAction}<MountAction handle={current} action={mountAction}/>{/if}
      <Dialog.Portal><Dialog.Popup>Dialog Content<Dialog.Close>Close</Dialog.Close></Dialog.Popup></Dialog.Portal>
    {/snippet}
  </Dialog.Root>
{/if}
{#if sameCommit}<MountAction handle={current} action="open" triggerId="trigger"/>{/if}
