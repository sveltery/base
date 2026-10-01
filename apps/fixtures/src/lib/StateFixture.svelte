<script lang="ts">
  // Base UI v1.8.0 R:239/431 and C:25/55/89/118/137. MIT: parity/dialog/UPSTREAM_LICENSE.
  import { Dialog } from '@sveltery/base';
  import type { HTMLAttributes } from 'svelte/elements';
  import { onMount } from 'svelte';
  import type { Actions, ChangeEventDetails } from '@sveltery/base/dialog';
  let { scenario }: { scenario: string } = $props();
  let hydrated = $state(false);
  let secondTrigger = $state(false);
  let actions = $state<Actions | null>(null);
  let calls = $state<{ open: boolean; reason: string; trigger: string | null; triggerIsUndefined: boolean }[]>([]);
  let clicks = $state(0);
  let owner = $state(false);
  let controlled = $state(true);
  let cancel = $state(false);
  let order = $state<{ channel: string; open: boolean; before: string | null; reason: string; canceled: boolean }[]>([]);
  function observe(channel: string, open: boolean, details: ChangeEventDetails) {
    order.push({ channel, open, before: document.getElementById('state-trigger')?.getAttribute('aria-expanded') ?? null, reason: details.reason, canceled: details.isCanceled });
  }
  function consumer(open: boolean, details: ChangeEventDetails) {
    if (cancel) details.cancel();
    calls.push({ open, reason: details.reason, trigger: details.trigger?.id ?? null, triggerIsUndefined: details.trigger === undefined });
    if (scenario === 'controlled') observe('consumer', open, details);
  }
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  {#if scenario === 'controlled'}
    <button onclick={() => { owner = true; }}>Owner open</button>
    <button onclick={() => { owner = false; }}>Owner close</button>
    <button onclick={() => { cancel = !cancel; }}>Toggle cancel</button>
    <button onclick={() => { controlled = false; }}>Release control</button>
  {/if}
  {#if scenario === 'missing'}<button onclick={() => actions?.close()}>Imperative close</button>{/if}
  <Dialog.Root modal={scenario === 'native' || scenario === 'custom' || scenario === 'undefined' ? true : false}
    defaultOpen={scenario === 'missing' || scenario === 'prevent'}
    defaultTriggerId={scenario === 'missing' ? 'missing-trigger' : undefined}
    open={scenario === 'closed' ? false : scenario === 'controlled' && controlled ? owner : undefined}
    bind:actions onOpenChange={consumer}
    onInternalOpenChange={scenario === 'controlled' ? (open, details) => observe('internal', open, details) : undefined}>
    {#if scenario === 'ownership'}
      <Dialog.Trigger id="trigger-1">Trigger 1</Dialog.Trigger>
      {#if secondTrigger}<Dialog.Trigger id="trigger-2">Trigger 2</Dialog.Trigger>{/if}
    {:else if scenario !== 'missing' && scenario !== 'prevent' && scenario !== 'closed'}
      <Dialog.Trigger id="state-trigger">Open</Dialog.Trigger>
    {/if}
    <Dialog.Portal keepMounted={scenario === 'closed'}>
      <Dialog.Popup>
        {#if scenario === 'ownership'}
          <button onclick={() => { secondTrigger = true; }}>Mount trigger 2</button>
        {:else if scenario === 'missing'}Dialog
        {:else if scenario === 'custom'}
          <Dialog.Close disabled nativeButton={false}>
            {#snippet render(props, _state, children)}<span {...props as HTMLAttributes<HTMLSpanElement>}>{@render children?.()}</span>{/snippet}
            Close
          </Dialog.Close>
        {:else}
          <Dialog.Close disabled={scenario === 'native'} onclick={scenario === 'undefined' ? undefined : event => {
            if (scenario === 'prevent') event.preventBaseUIHandler();
            if (scenario === 'closed') clicks += 1;
          }}>Close</Dialog.Close>
        {/if}
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
  <output data-testid="calls">{JSON.stringify(calls)}</output>
  <output data-testid="clicks">{clicks}</output>
  <output data-testid="owner">{String(owner)}</output>
  <output data-testid="order">{JSON.stringify(order)}</output>
</main>
