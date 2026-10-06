<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import * as Dialog from '../../../../packages/base/src/lib/dialog/index.js';
  import { createDialogHandle } from '../../../../packages/base/src/lib/dialog/handle.svelte.js';
  import type { ChangeEventDetails } from '../../../../packages/base/src/lib/dialog/types.js';
  import Spy from './DialogRootOpenChangeSpy.svelte';
  import Labels from './DialogRootLabels.svelte';
  import type { RootFixtureApi, RootVariant } from './dialog-root-cases.js';
  let { line, variant }: { line: number; variant: RootVariant } = $props();
  const handle = createDialogHandle();
  const api: RootFixtureApi = { calls: [], events: [], completions: [] };
  let hydrated = $state(false);
  let open = $state(untrack(() => line === 1319));
  const defaultOpen = $derived([459, 472, 485, 555, 582].includes(line));
  const controlled = $derived([306, 333, 1319, 1399].includes(line));
  function change(value: boolean, details: ChangeEventDetails) {
    api.calls.push({
      open: value,
      reason: details.reason,
      hasTrigger: details.trigger !== undefined,
    });
    if ((line === 535 && value) || (line === 582 && !value)) details.cancel();
  }
  function attach(node: HTMLElement) {
    Object.assign(node, { api });
    return () => {
      delete (node as HTMLElement & { api?: RootFixtureApi }).api;
    };
  }
  onMount(() => {
    hydrated = true;
  });
</script>

{#snippet trigger()}<Dialog.Trigger
    handle={variant === 'contained' ? undefined : handle}
    data-testid="trigger">Open</Dialog.Trigger
  >{/snippet}
<main data-hydrated={hydrated} {@attach attach}>
  {#if line === 1319 || line === 1399}<button
      type="button"
      onclick={() => {
        open = line === 1399;
      }}>{line === 1319 ? 'Close externally' : 'Open externally'}</button
    >{/if}
  {#if variant !== 'contained'}{@render trigger()}{/if}
  {#if variant === 'multiple'}<Dialog.Trigger {handle} data-testid="trigger-2"
      >Open another</Dialog.Trigger
    >{/if}
  <Dialog.Root
    handle={variant === 'contained' ? undefined : handle}
    {defaultOpen}
    open={controlled ? ([306, 333].includes(line) ? true : open) : undefined}
    modal={[280, 306, 333, 485].includes(line) ? false : true}
    onOpenChange={change}
    onOpenChangeComplete={(value) => api.completions.push(value)}
  >
    {#if variant === 'contained'}{@render trigger()}{/if}
    <Dialog.Portal>
      {#if line === 306}<Dialog.Backdrop
          data-testid="backdrop"
          style="position:fixed;z-index:10;inset:0"
        />{/if}
      <Dialog.Popup data-testid="dialog-popup" style="position:fixed;z-index:10">
        {#if line === 306}<Dialog.Title>title text</Dialog.Title><Dialog.Description
            >description text</Dialog.Description
          >
        {:else if line === 333}<Labels />
        {:else}
          {#if line === 555 || line === 582}<Spy
              observe={(details) => api.events.push(details)}
            />{/if}
          <p>Dialog content</p><Dialog.Close>Close</Dialog.Close>
        {/if}
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
</main>
