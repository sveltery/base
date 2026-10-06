<script lang="ts">
  // Native public composition witness; no ordinary assertion credit.
  import { onMount } from 'svelte';
  import { Dialog } from '@sveltery/base';
  let { keep = false }: { keep?: boolean } = $props();
  const handle = Dialog.createHandle<number>();
  let hydrated = $state(false),
    visible = $state(true);
  let first = $state<HTMLElement | null>(null),
    second = $state<HTMLElement | null>(null);
  let container = $state<HTMLElement | null>(null),
    actions = $state<Dialog.Root.Actions | null>(null);
  let portal = $state<HTMLElement | null>(null),
    viewport = $state<HTMLElement | null>(null);
  let portalId = $state<string | undefined>('closure-portal');
  const completed = $state<boolean[]>([]);
  onMount(() => {
    container = first;
    hydrated = true;
  });
  function command(value: string) {
    if (value === 'second') container = second;
    if (value === 'id') portalId = 'closure-renamed';
    if (value === 'clear-id') portalId = undefined;
    if (value === 'unmount') actions?.unmount();
    if (value === 'remove') visible = false;
  }
</script>

{#snippet replacement(props: Record<string | symbol, unknown>)}
  <div data-testid="closure-wrapper"
    ><section {...props} id={portalId} data-testid="closure-portal"></section></div
  >
{/snippet}
<main
  data-hydrated={hydrated}
  {@attach (node) => {
    Object.assign(node, {
      closureCommand: command,
      closureRefs: () => ({ portal: !!portal, viewport: !!viewport, actions: !!actions }),
    });
  }}
>
  <aside data-testid="closure-first" bind:this={first}></aside>
  <aside data-testid="closure-second" bind:this={second}></aside>
  <output data-testid="closure-refs"
    >{JSON.stringify({ portal: !!portal, viewport: !!viewport, actions: !!actions })}</output
  >
  <output data-testid="closure-completed">{JSON.stringify(completed)}</output>
  {#if visible}
    <Dialog.Trigger {handle} id="closure-trigger" payload={7}>Open closure</Dialog.Trigger>
    <Dialog.Root
      {handle}
      bind:actions
      modal={false}
      onOpenChange={(open, details) => {
        if (!open) details.preventUnmountOnClose();
      }}
      onOpenChangeComplete={(open) => completed.push(open)}
    >
      {#snippet children({ payload })}
        <Dialog.Portal {container} keepMounted={keep} render={replacement} bind:ref={portal}>
          <Dialog.Viewport
            bind:ref={viewport}
            data-testid="closure-viewport"
            class={(state) => ['viewport', { active: state.open }]}
            style={(state) => ({ '--open': Number(state.open) })}
          >
            <Dialog.Popup>
              <Dialog.Title>Source closure</Dialog.Title><Dialog.Description
                >Public parts</Dialog.Description
              >
              <output data-testid="closure-payload">{payload}</output><Dialog.Close
                id="closure-close">Close closure</Dialog.Close
              >
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      {/snippet}
    </Dialog.Root>
  {/if}
</main>
