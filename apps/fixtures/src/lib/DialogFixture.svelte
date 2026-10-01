<script lang="ts">
  import { Dialog } from '@sveltery/base';
  import type { Actions, ChangeEventDetails } from '@sveltery/base/dialog';
  import type { PreventableEvent } from '@sveltery/base/merge-props';
  import { onMount } from 'svelte';
  let { mode = 'uncontrolled', modal = true, initial = false, keep = false, cancel = '', prevent = false, custom = false, focus = 'default', animate = false, nested = false, disabled = false }: { mode?: string; modal?: boolean | 'trap-focus'; initial?: boolean; keep?: boolean; cancel?: string; prevent?: boolean; custom?: boolean; focus?: string; animate?: boolean; nested?: boolean; disabled?: boolean } = $props();
  let open = $state(initial);
  let visible = $state(true);
  let title = $state(true);
  let titleId = $state<string | undefined>(undefined);
  let actions = $state<Actions | null>(null);
  let finalInput: HTMLInputElement;
  let secondInput: HTMLInputElement;
  let hydrated = $state(false);
  let log = $state<{ channel: string; open?: boolean; reason?: string; trigger?: string; event?: string; before?: boolean }[]>([]);
  function change(next: boolean, details: ChangeEventDetails) {
    log.push({ channel: 'consumer', open: next, reason: details.reason, trigger: details.trigger?.id, event: details.event.type, before: open });
    if (cancel === (next ? 'open' : 'close')) details.cancel();
    if (cancel === 'defer' && !next) details.preventUnmountOnClose();
    if (mode === 'controlled' && !details.isCanceled) open = next;
  }
  function composed(event: MouseEvent & PreventableEvent) { log.push({ channel: 'click' }); if (prevent) event.preventBaseUIHandler(); }
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  <input aria-label="before" />
  <input aria-label="final" bind:this={finalInput}/>
  <button onclick={() => open = !open}>Owner toggle</button>
  <button onclick={() => visible = !visible}>Mount toggle</button>
  <button onclick={() => title = !title}>Title toggle</button>
  <button onclick={() => titleId = 'replacement-title'}>Title ID</button>
  <button onclick={() => actions?.close()}>Imperative close</button>
  <button onclick={() => actions?.unmount()}>Imperative unmount</button>
  {#if visible}
    <Dialog.Root open={mode === 'uncontrolled' ? undefined : open} defaultOpen={initial} {modal} bind:actions onOpenChange={change}
      onInternalOpenChange={(next, details) => log.push({ channel: 'internal', open: next, reason: details.reason })}
      onOpenChangeComplete={(next) => log.push({ channel: 'complete', open: next })}>
      {#if custom}
        <Dialog.Trigger id="trigger" {disabled} nativeButton={false} onclick={composed}>
          {#snippet render(props, state)}<span {...props} data-custom-open={state.open}>Open</span>{/snippet}
        </Dialog.Trigger>
      {:else}
        <Dialog.Trigger id="trigger" {disabled} onclick={composed}>Open</Dialog.Trigger>
      {/if}
      <Dialog.Trigger id="other-trigger">Other open</Dialog.Trigger>
      <Dialog.Portal keepMounted={keep}>
        <Dialog.Backdrop data-testid="backdrop" class="backdrop"/>
        <Dialog.Popup data-testid="popup" class={animate ? 'popup animated' : 'popup'} initialFocus={focus === 'false' ? false : focus === 'second' ? () => secondInput : focus === 'conditional' ? type => type === 'keyboard' ? secondInput : undefined : undefined} finalFocus={focus === 'final' ? () => finalInput : focus === 'false-final' ? false : undefined}>
          {#if title}<Dialog.Title id={titleId}>Dialog title</Dialog.Title>{/if}
          <Dialog.Description>Dialog description</Dialog.Description>
          <input aria-label="first"/>
          <input aria-label="second" bind:this={secondInput}/>
          {#if nested}
            <Dialog.Root>
              <Dialog.Trigger>Child open</Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Backdrop data-testid="child-backdrop" forceRender class="backdrop child-backdrop"/>
                <Dialog.Popup class="popup child-popup" data-testid="child-popup">
                  <Dialog.Title>Child</Dialog.Title>
                  <input aria-label="child-input"/>
                  <Dialog.Close>Child close</Dialog.Close>
                  <Dialog.Root>
                    <Dialog.Trigger>Grandchild open</Dialog.Trigger>
                    <Dialog.Portal><Dialog.Popup class="popup grandchild-popup" data-testid="grandchild-popup"><Dialog.Close>Grandchild close</Dialog.Close></Dialog.Popup></Dialog.Portal>
                  </Dialog.Root>
                </Dialog.Popup>
              </Dialog.Portal>
            </Dialog.Root>
          {/if}
          <Dialog.Close onclick={composed}>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  {/if}
  <input aria-label="after"/>
  <output data-testid="log">{JSON.stringify(log)}</output>
</main>
<style>
  :global(.backdrop) { position: fixed; inset: 0; background: #0003; }
  :global(.popup) { position: fixed; left: 200px; top: 80px; width: 300px; padding: 20px; background: white; border: 1px solid; }
  :global(.child-popup) { left: 300px; top: 120px; }
  :global(.grandchild-popup) { left: 400px; top: 180px; }
  :global(.animated) { transition: opacity 200ms; }
  :global(.animated[data-starting-style]), :global(.animated[data-ending-style]) { opacity: 0; }
  output { display: block; max-width: 600px; overflow-wrap: anywhere; }
</style>
