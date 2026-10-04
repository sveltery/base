<script lang="ts">
  // Topologies copied from the immutable complete AlertDialogRoot.test.tsx bodies (MIT).
  import { onMount, tick, untrack } from 'svelte';
  import { AlertDialog } from '@sveltery/base';
  import State from './AlertDialogState.svelte';
  import Wrappers from './AlertDialogTriggerWrappers.svelte';
  let { line = 136, handle, cancellation = false, retention = false }: { line?: number; handle?: AlertDialog.Handle<number>; cancellation?: boolean; retention?: boolean } = $props();
  const sourceLine = untrack(() => line);
  const first = untrack(() => handle ?? AlertDialog.createHandle<number>());
  let current = $state(first);
  let mounted = $state(true);
  let nesting = $state(sourceLine === 726 ? 0 : 3);
  const defaultOpen = [32, 78, 97, 121, 196, 216, 366, 1047].includes(sourceLine);
  const controlled = [57, 236, 1064, 1094, 1147, 1177, 11].includes(sourceLine);
  let open = $state([57, 1064, 1094].includes(sourceLine));
  const withHandle = untrack(() => handle !== undefined) || [78, 97, 236, 600, 649, 708, 726, 744, 777, 795, 833, 868, 902, 931, 965, 1006].includes(sourceLine);
  const detached = untrack(() => handle !== undefined) || sourceLine === 97 || sourceLine >= 600 && sourceLine <= 1006;
  const reparent = [708, 726, 777].includes(sourceLine);
  const multiple = [57, 436, 469, 497, 795, 833, 965, 1006].includes(sourceLine);
  const three = [390, 600].includes(sourceLine);
  const noTrigger = [121, 366, 1064, 1094, 1147, 1177, 11].includes(sourceLine);
  let hydrated = $state(false);
  let actions = $state<AlertDialog.Root.Actions | null>(null);
  let root = $state<ReturnType<typeof AlertDialog.Root<number>> | undefined>();
  let retained = true;
  const changes = $state<{ open: boolean; reason: string; triggerId?: string }[]>([]);
  const completed = $state<boolean[]>([]);
  onMount(() => { hydrated = true; });
  const api = {
    open(id: string | null) { current.open(id); },
    payload(value: number) { current.openWithPayload(value); },
    close() { current.close(); },
    isOpen() { return current.isOpen; },
    unmount() { actions?.unmount(); },
    exportedClose() { root?.close(); },
    exportedUnmount() { root?.unmount(); },
    async owner(value: boolean) { open = value; await tick(); },
    async remove() { mounted = false; await tick(); },
    async mount() { mounted = true; await tick(); },
    async wrappers(value: number, recreate = false) { nesting = value; if (recreate) current = AlertDialog.createHandle<number>(); await tick(); },
    async recreate() { current = AlertDialog.createHandle<number>(); await tick(); },
    snapshot() { return { changes: [...changes], completed: [...completed], actions: !!actions, isOpen: current.isOpen }; },
  };
</script>
{#snippet triggers()}
  {#if !noTrigger}
    {#if reparent}<Wrappers handle={current} {nesting}/>
    {:else if multiple || three}
      <AlertDialog.Trigger handle={detached ? current : undefined} id="trigger-1" payload={1}>Trigger 1</AlertDialog.Trigger>
      <AlertDialog.Trigger handle={detached ? current : undefined} id="trigger-2" payload={2}>Trigger 2</AlertDialog.Trigger>
      {#if three}<AlertDialog.Trigger handle={detached ? current : undefined} id="trigger-3">Trigger 3</AlertDialog.Trigger>{/if}
    {:else}<AlertDialog.Trigger handle={detached ? current : undefined} id="trigger" data-testid="trigger">{sourceLine === 649 ? 'Trigger' : 'Open'}</AlertDialog.Trigger>{/if}
  {/if}
{/snippet}
{#snippet popup(payload: number | undefined)}
  <AlertDialog.Popup {...(sourceLine === 10 ? { id: 'TestId' } : {})} data-testid="popup" class={sourceLine === 1094 ? 'alert-exit' : sourceLine === 1177 ? 'alert-enter' : undefined}>
    {#if sourceLine === 32}<AlertDialog.Title>title text</AlertDialog.Title><AlertDialog.Description>description text</AlertDialog.Description>{/if}
    {#if sourceLine === 236}<AlertDialog.Title>Confirm</AlertDialog.Title>{/if}
    {#if [436, 795, 965, 1006].includes(sourceLine)}<span data-testid="content">{payload}</span>
    {:else if [469, 833].includes(sourceLine)}<span>{payload}</span>
    {:else}<span data-testid="content">{sourceLine === 868 ? 'Content' : sourceLine === 931 ? 'Content' : multiple || three || detached ? 'Alert dialog content' : 'Dialog'}</span>{/if}
    {#if sourceLine === 649}<button type="button" onclick={() => { mounted = false; }}>Unmount root</button>{/if}
    {#if ![469, 497, 833, 868, 965, 1006].includes(sourceLine)}<AlertDialog.Close>{sourceLine === 236 ? 'Cancel' : 'Close'}</AlertDialog.Close>{/if}
  </AlertDialog.Popup>
{/snippet}
<main data-hydrated={hydrated} {@attach node => { Object.assign(node, { alertApi: api }); }}>
  {#if detached}{@render triggers()}{/if}
  {#if !mounted}<button type="button" onclick={() => { mounted = true; }}>Remount root</button>{/if}
  {#if [1064, 1094].includes(sourceLine)}<button type="button" onclick={() => { open = false; }}>Close</button>{/if}
  {#if [1147, 1177].includes(sourceLine)}<button type="button" onclick={() => { open = true; }}>Open</button>{/if}
  {#if mounted}
    <AlertDialog.Root handle={withHandle ? current : undefined} {defaultOpen} open={controlled ? open : undefined} triggerId={sourceLine === 57 ? 'trigger-2' : undefined} defaultTriggerId={[78, 97].includes(sourceLine) ? 'trigger' : undefined} bind:actions bind:this={root}
      onOpenChange={(value, details) => {
        changes.push({ open: value, reason: details.reason, ...(details.trigger?.id ? { triggerId: details.trigger.id } : {}) });
        if (cancellation) details.cancel();
        if (retention && !value) details.preventUnmountOnClose();
        if (sourceLine === 236 && value) open = true;
        if ([281, 320].includes(sourceLine) && !value && retained) { details.preventUnmountOnClose(); if (sourceLine === 320) retained = false; }
      }} onOpenChangeComplete={value => completed.push(value)}>
      {#snippet children({ payload })}
        {#if !detached}{@render triggers()}{/if}
        {#if sourceLine === 868}<State/>{/if}
        <AlertDialog.Portal>
          {#if sourceLine === 32}<AlertDialog.Backdrop/>{/if}
          {#if sourceLine === 121}<AlertDialog.Viewport data-testid="viewport">{@render popup(payload)}</AlertDialog.Viewport>
          {:else}{@render popup(payload)}{/if}
        </AlertDialog.Portal>
      {/snippet}
    </AlertDialog.Root>
  {/if}
  <output data-testid="changes">{JSON.stringify(changes)}</output>
  <output data-testid="completed">{JSON.stringify(completed)}</output>
</main>
<style>
  :global(.alert-exit[data-ending-style]) { animation: alert-out 1ms; }
  :global(.alert-enter[data-starting-style]) { animation: alert-in 1ms; }
  @keyframes alert-out { to { opacity: 0; } }
  @keyframes alert-in { from { opacity: 0; } }
</style>
