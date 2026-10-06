<script lang="ts">
  // Portable complete-body D adapters. MIT: parity/dialog/UPSTREAM_LICENSE.
  import { onMount, tick, untrack } from 'svelte';
  import * as Dialog from '../../../../packages/base/src/lib/dialog/index.js';
  import { createDialogHandle } from '../../../../packages/base/src/lib/dialog/handle.svelte.js';
  import MountAction from './DialogHandleMountAction.svelte';
  import Wrappers from './DialogHandleWrappers.svelte';
  import AccessorTriggers from './DialogHandleAccessorTriggers.svelte';
  import PersistentTrigger from './DialogHandlePersistentTrigger.svelte';
  import RouteRoot from './DialogHandleRouteRoot.svelte';
  import {
    containedCases,
    overlapCases,
    reparentCases,
    noTriggerCases,
    generatedTriggerCases,
    type HandleFixtureApi,
    type Payload,
  } from './dialog-handle-cases.js';
  let { line }: { line: number } = $props();
  const handleA = createDialogHandle<Payload>();
  const handleB = createDialogHandle<Payload>();
  let current = $state(handleA);
  let ready = $state(untrack(() => line !== 186));
  let mounted = $state(true);
  let attached = $state(untrack(() => line !== 549));
  let dirty = $state(untrack(() => line === 412));
  let phase = $state<'outgoing' | 'overlap' | 'incoming'>(
    untrack(() => (line === 845 ? 'overlap' : 'outgoing')),
  );
  let nesting = $state(untrack(() => ([1664, 1682, 1711].includes(line) ? 0 : 3)));
  let mode = $state<'uncontrolled' | 'controlled'>(
    untrack(() => (line === 1518 ? 'controlled' : 'uncontrolled')),
  );
  let open = $state(untrack(() => [1078, 1711].includes(line)));
  let triggerId = $state<string | null>(
    untrack(() => (line === 1078 ? 'trigger-2' : line === 1711 ? 'trigger' : null)),
  );
  let payloads = $state([1, 2]);
  let hydrated = $state(false);
  const contained = $derived(containedCases.includes(line));
  const overlap = $derived(overlapCases.includes(line));
  const reparent = $derived(reparentCases.includes(line));
  const controlled = $derived([1078, 1100, 1711].includes(line) || mode === 'controlled');
  const rootHandle = $derived(contained ? undefined : attached ? current : undefined);
  function handle(which?: 'A' | 'B') {
    return which === 'A' ? handleA : which === 'B' ? handleB : current;
  }
  const api: HandleFixtureApi = {
    open(id, which) {
      handle(which).open(id);
    },
    payload(value, which) {
      handle(which).openWithPayload(value);
    },
    close(which) {
      handle(which).close();
    },
    isOpen(which) {
      return handle(which).isOpen;
    },
    async phase(value) {
      phase = value;
      await tick();
    },
    async wrappers(value, recreate = false) {
      nesting = value;
      if (recreate) current = createDialogHandle<Payload>();
      await tick();
    },
    async recreate() {
      current = createDialogHandle<Payload>();
      await tick();
    },
    async mount() {
      ready = true;
      mounted = true;
      await tick();
    },
    warnings: [],
  };
  function attach(node: HTMLElement) {
    const host = node as HTMLElement & { api?: HandleFixtureApi };
    host.api = api;
    return () => {
      delete host.api;
    };
  }
  onMount(() => {
    hydrated = true;
  });
  function remount() {
    if (line === 1518) mode = 'uncontrolled';
    if (line === 1579) mode = 'controlled';
    mounted = true;
  }
</script>

{#snippet triggers()}
  {#if reparent}<Wrappers handle={current} {nesting} id={line === 1711 ? 'trigger' : undefined} />
  {:else if line === 1835}<AccessorTriggers handle={current} />
  {:else if !noTriggerCases.includes(line)}
    {#if line === 641}<Dialog.Trigger handle={current} id="other" payload={9}>Other</Dialog.Trigger
      >{/if}
    {#if line === 2028}<Dialog.Trigger handle={handleA} id="a" payload={1}>A trigger</Dialog.Trigger
      >
    {:else}
      <Dialog.Trigger
        handle={contained ? undefined : current}
        id={generatedTriggerCases.includes(line)
          ? undefined
          : line === 2088 || line === 2129
            ? 'trigger1'
            : [1078, 1100, 1157, 1323].includes(line)
              ? 'trigger-1'
              : 'trigger'}
        payload={line === 641
          ? 5
          : line === 1955
            ? 7
            : [186, 249, 412, 987, 1020, 1100, 1157, 1764, 1802, 2088, 2129].includes(line)
              ? payloads[0]
              : undefined}
      >
        {line === 1157
          ? 'Dialog 1'
          : [939, 987, 1020, 1048, 1078, 1274, 1323, 1764, 1802, 1891, 2088, 2129].includes(line)
            ? 'Trigger 1'
            : line === 1100
              ? 'One'
              : 'Trigger'}
      </Dialog.Trigger>
    {/if}
    {#if [939, 987, 1020, 1048, 1078, 1100, 1157, 1274, 1323, 1764, 1802, 1891, 2088, 2129].includes(line)}
      <Dialog.Trigger
        handle={contained ? undefined : current}
        id={generatedTriggerCases.includes(line)
          ? undefined
          : line === 2088 || line === 2129
            ? 'trigger2'
            : 'trigger-2'}
        payload={[939, 1048, 1078, 1274, 1323, 1891].includes(line) ? undefined : payloads[1]}
        >{line === 1157 ? 'Dialog 2' : line === 1100 ? 'Two' : 'Trigger 2'}</Dialog.Trigger
      >
    {/if}
    {#if line === 939 || line === 1274}<Dialog.Trigger handle={contained ? undefined : current}
        >Trigger 3</Dialog.Trigger
      >{/if}
  {/if}
{/snippet}
{#snippet content(payload: Payload | undefined, name = 'Dialog Content')}
  {#if [99, 126, 159].includes(line)}{#if line === 126}<span data-testid="payload"
        >{payload ?? 'No payload'}</span
      >{/if}
  {:else}
    {#if [186, 249, 412, 641, 1389, 1955].includes(line)}<span data-testid="payload"
        >{payload ?? 'No payload'}</span
      >{/if}
    <Dialog.Portal>
      <Dialog.Popup
        data-testid={line === 1921 || line === 2088 || line === 2129 ? 'content' : 'dialog-popup'}
      >
        {#if [987, 1100, 1157, 1764, 1835].includes(line)}<span data-testid="content"
            >{typeof payload === 'function' ? payload() : payload}</span
          >
        {:else if line === 2088 || line === 2129}{payload}
        {:else if line === 1921}Content
        {:else}{name}{/if}
        {#if line === 1020 || line === 1802}<span>{payload}</span>{/if}
        {#if [249, 1323, 1389, 1518, 1955].includes(line)}<button
            type="button"
            onclick={() => {
              mounted = false;
            }}>Unmount root</button
          >{/if}
        {#if line === 1157}<button
            type="button"
            onclick={() => {
              payloads = [8, 16];
            }}>Update payloads</button
          >{/if}
        {#if [939, 987, 1100, 1274, 1646, 1664, 1682, 1746, 1764].includes(line)}<Dialog.Close
            >Close</Dialog.Close
          >{/if}
      </Dialog.Popup>
    </Dialog.Portal>
  {/if}
{/snippet}
<main data-hydrated={hydrated} {@attach attach}>
  {#if dirty}
    <Dialog.Root handle={handleB}>
      {#snippet children({ payload })}
        <span data-testid="dirty-payload">{payload ?? 'No payload'}</span>
        <Dialog.Portal
          ><Dialog.Popup
            >Dirty dialog<button
              type="button"
              onclick={() => {
                dirty = false;
              }}>Unmount dirty root</button
            ></Dialog.Popup
          ></Dialog.Portal
        >
      {/snippet}
    </Dialog.Root>
  {:else if line === 1444}
    <PersistentTrigger handle={handleA} /><RouteRoot handle={handleA} />
  {:else if ready}
    {#if !contained && line !== 612}{@render triggers()}{/if}
    {#if line === 490}<button
        type="button"
        onclick={() => {
          current = handleA;
        }}>Use handle A</button
      ><button
        type="button"
        onclick={() => {
          current = handleB;
        }}>Use handle B</button
      >{/if}
    {#if line === 549}<button
        type="button"
        onclick={() => {
          attached = !attached;
        }}>Toggle handle</button
      >{/if}
    {#if line === 412}<button
        type="button"
        onclick={() => {
          current = handleB;
        }}>Switch to handle B</button
      >{/if}
    {#if line === 2028}<button
        type="button"
        onclick={() => {
          current = handleB;
        }}>Switch root to B</button
      >{/if}
    {#if line === 1518 || line === 1579}<button
        type="button"
        onclick={() => {
          mounted = false;
        }}>Unmount root</button
      >{/if}
    {#if !mounted}<button type="button" onclick={remount}
        >{line === 1518
          ? 'Remount uncontrolled root'
          : line === 1579
            ? 'Remount controlled root'
            : 'Remount root'}</button
      >{/if}
    {#if overlap}
      {#if phase === 'outgoing' || phase === 'overlap'}<Dialog.Root
          handle={current}
          modal={line === 871 ? false : true}
          ><Dialog.Portal
            ><Dialog.Popup>{line === 845 ? 'First' : 'Outgoing'}</Dialog.Popup></Dialog.Portal
          ></Dialog.Root
        >{/if}
      {#if phase === 'overlap' || phase === 'incoming'}
        <Dialog.Root handle={current} modal={line === 871 ? false : true}
          ><Dialog.Portal
            ><Dialog.Popup>{line === 845 ? 'Second' : 'Incoming'}</Dialog.Popup></Dialog.Portal
          ></Dialog.Root
        >
        {#if line === 871}<MountAction handle={current} action="open" id="trigger" />{/if}
      {/if}
    {:else if mounted}
      {#key mode}
        <Dialog.Root
          handle={rootHandle}
          open={controlled ? (mode === 'controlled' ? true : open) : undefined}
          triggerId={controlled ? (mode === 'controlled' ? 'trigger' : triggerId) : undefined}
          defaultOpen={line === 159}
          modal={[490, 549, 871, 1711, 1835, 1891, 2028].includes(line) ? false : true}
          disablePointerDismissal={[490, 549, 1835, 2028].includes(line)}
          onOpenChange={(value) => {
            if (line === 1100) open = value;
          }}
        >
          {#snippet children({ payload })}
            {#if contained}{@render triggers()}{/if}
            {#if [99, 126, 159].includes(line)}<MountAction
                handle={current}
                action={line === 99 ? 'open' : line === 126 ? 'payload' : 'close'}
              />{/if}
            {@render content(payload)}
          {/snippet}
        </Dialog.Root>
      {/key}
    {/if}
    {#if line === 612}{@render triggers()}{/if}
    {#if line === 641}<MountAction handle={current} action="open" id="trigger" />{/if}
    {#if line === 1100}<button
        type="button"
        onclick={() => {
          triggerId = 'trigger-2';
          open = true;
        }}>Open programmatically</button
      >{/if}
  {/if}
</main>
