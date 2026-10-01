<script lang="ts">
  // Three review regressions against pinned Base UI v1.8.0; MIT, see parity/dialog/UPSTREAM_LICENSE.
  import { onMount } from 'svelte';
  import { Dialog } from '@sveltery/base';
  import type { Actions, ChangeEventDetails } from '@sveltery/base/dialog';
  import type { HTMLAttributes } from 'svelte/elements';
  let { scenario }: { scenario: string } = $props();
  let hydrated = $state(false);
  let visible = $state(true);
  let owner = $state(false);
  let actions = $state<Actions | null>(null);
  let container = $state.raw<ShadowRoot | null>(null);
  let calls = $state<{ open: boolean; canceled: boolean; trigger: string | null }[]>([]);
  let completed = $state<boolean[]>([]);
  let cancelNext = true;
  let retained: ChangeEventDetails | undefined;
  function change(open: boolean, details: ChangeEventDetails) {
    if (!open && (scenario === 'cancel' || scenario === 'controlled')) {
      if (cancelNext) { details.preventUnmountOnClose(); details.cancel(); cancelNext = false; retained = details; }
    } else if (!open && scenario === 'defer') details.preventUnmountOnClose();
    calls.push({ open, canceled: details.isCanceled, trigger: details.trigger?.id ?? null });
    if (!details.isCanceled) owner = open;
  }
  function commands(node: HTMLElement) {
    const host = node as HTMLElement & { regressionCommand?: (command: string) => void };
    host.regressionCommand = command => {
      if (command === 'close') actions?.close();
      else if (command === 'unmount') actions?.unmount();
      else if (command === 'remove') visible = false;
      else if (command === 'late-defer') retained?.preventUnmountOnClose();
    };
    return () => { delete host.regressionCommand; };
  }
  function shadow(node: HTMLElement) { container = node.attachShadow({ mode: 'open' }); return () => { container = null; }; }
  function content(node: HTMLElement) {
    if (!scenario.startsWith('shadow')) return;
    node.attachShadow({ mode: 'open' }).innerHTML = '<button id="first">First</button><slot></slot>';
  }
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated} {@attach commands}>
  <button id="before">Before</button>
  <Dialog.Root modal={false} open={scenario === 'controlled' ? owner : undefined} bind:actions onOpenChange={change} onOpenChangeComplete={open => completed.push(open)}>
    <Dialog.Trigger id="regression-trigger">Open</Dialog.Trigger>
    {#if visible}<Dialog.Portal container={scenario.startsWith('shadow') ? container : undefined} keepMounted={scenario === 'shadow-keep'}>
      <Dialog.Popup initialFocus={scenario === 'shadow-entry' || scenario === 'shadow-keep' ? false : undefined} style="position:relative;z-index:1">
        {#if scenario === 'disabled' || scenario === 'enabled'}
          <Dialog.Close disabled={scenario === 'disabled'} nativeButton={false}>
            {#snippet render(props, _state, children)}<a href="#activated" {...props as HTMLAttributes<HTMLAnchorElement>}>{@render children?.()}</a>{/snippet}
            Link close
          </Dialog.Close>
        {:else if scenario.startsWith('shadow')}
          <div id="content-host" {@attach content}><button id="last" tabindex="0">Last</button></div>
        {:else}<Dialog.Close>Close</Dialog.Close>{/if}
      </Dialog.Popup>
    </Dialog.Portal>{/if}
  </Dialog.Root>
  <button id="after">After</button>
  <div id="portal-host" {@attach shadow}></div>
  <button id="end">End</button>
  <output data-testid="calls">{JSON.stringify(calls)}</output>
  <output data-testid="completed">{JSON.stringify(completed)}</output>
</main>
