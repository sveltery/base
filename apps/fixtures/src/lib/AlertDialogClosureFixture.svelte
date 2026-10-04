<script lang="ts">
  // Actual cross-family and ShadowRoot whole-component supplements; no business replacement.
  import { onMount, untrack } from 'svelte';
  import { AlertDialog, Dialog } from '@sveltery/base';
  let { variant }: { variant: 'dialog-parent' | 'alert-parent' | 'shadow' } = $props();
  const Outer = untrack(() => variant === 'dialog-parent' ? Dialog : AlertDialog);
  const Inner = untrack(() => variant === 'dialog-parent' ? AlertDialog : Dialog);
  let hydrated = $state(false);
  let host = $state<HTMLElement | null>(null);
  let container = $state<ShadowRoot | null>(null);
  let visible = $state(true);
  onMount(() => { if (variant === 'shadow' && host) container = host.attachShadow({ mode: 'open' }); hydrated = true; });
</script>
<main data-hydrated={hydrated} {@attach node => { Object.assign(node, { removeAlertClosure: () => { visible = false; } }); }}>
  <button type="button" id="closure-outside">Outside</button>
  {#if variant === 'shadow'}<div id="closure-shadow" bind:this={host}></div>{/if}
  {#if visible}
    <Outer.Root>
      <Outer.Trigger id="closure-outer-trigger">Open outer</Outer.Trigger>
      <Outer.Portal container={variant === 'shadow' ? container : undefined}>
        <Outer.Backdrop data-testid="closure-backdrop"/>
        <Outer.Viewport data-testid="closure-viewport">
          <Outer.Popup data-testid="closure-parent" style={{ position: 'relative', zIndex: 1 }}>
            <Outer.Title>Outer confirmation</Outer.Title><Outer.Description>Closure parent</Outer.Description>
            {#if variant !== 'shadow'}
              <Inner.Root>
                <Inner.Trigger>Open inner</Inner.Trigger>
                <Inner.Portal><Inner.Backdrop/><Inner.Popup data-testid="closure-inner" style={{ position: 'relative', zIndex: 2 }}>
                  <Inner.Title>Inner confirmation</Inner.Title><Inner.Close>Close inner</Inner.Close>
                </Inner.Popup></Inner.Portal>
              </Inner.Root>
            {/if}
            <Outer.Close id="closure-outer-close">Close outer</Outer.Close>
          </Outer.Popup>
        </Outer.Viewport>
      </Outer.Portal>
    </Outer.Root>
  {/if}
</main>
