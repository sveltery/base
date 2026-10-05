<script lang="ts">
  import * as Dialog from '../../src/lib/dialog/index.js';
  import type { DialogHandle } from '../../src/lib/dialog/store/DialogHandle.svelte.js';
  import type { DialogPortalProps } from '../../src/lib/dialog/types.js';
  import Probe from './DialogPortalContextProbe.svelte';
  let { handle, container, report, keep = true }: { handle: DialogHandle<number>; container?: DialogPortalProps['container']; report: (name: string, provided: boolean) => void; keep?: boolean } = $props();
  let portalId = $state<string | undefined>('replacement-portal');
  let viewport = $state<HTMLElement | null>(null);
  let portal = $state<HTMLElement | null>(null);
  export function setId(id?: string) { portalId = id; }
  export function refs() { return { portal, viewport }; }
</script>
{#snippet replacement(props: Record<string | symbol, unknown>)}
  <div data-testid="portal-wrapper">
    <Probe name="replacement" {report}/>
    <section {...props} id={portalId} data-testid="parts-portal"></section>
  </div>
{/snippet}
<Dialog.Root {handle} modal={false}>
  {#snippet children({ payload })}
  <Dialog.Trigger id="parts-trigger" payload={7}>Open parts</Dialog.Trigger>
  <Dialog.Portal {container} keepMounted={keep} render={replacement} bind:ref={portal}>
    <Probe name="children" {report}/>
    <Dialog.Viewport bind:ref={viewport} class={state => ['native-viewport', { active: state.open }]} style={state => ({ '--open': Number(state.open) })} data-testid="parts-viewport">
      <Dialog.Popup><Dialog.Title>Parts title</Dialog.Title><Dialog.Description>Parts description</Dialog.Description><output>{payload}</output><Dialog.Close>Close parts</Dialog.Close></Dialog.Popup>
    </Dialog.Viewport>
  </Dialog.Portal>
  {/snippet}
</Dialog.Root>
