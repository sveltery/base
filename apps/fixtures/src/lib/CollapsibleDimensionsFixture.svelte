<script lang="ts">
  // Actual public-component/native-element ownership witnesses; zero ordinary credit.
  import { flushSync, onMount, untrack, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { Collapsible, type CollapsiblePanelState } from '@sveltery/base';
  let { bare = false, forwarded = false, initiallyOpen = false }: { bare?: boolean; forwarded?: boolean; initiallyOpen?: boolean } = $props();
  let open = $state(untrack(() => initiallyOpen)), shown = $state(true), hostTag = $state('div'), hydrated = $state(false);
  let authoredStyle = $state.raw<string | Record<string, unknown> | undefined>();
  let ref = $state<HTMLElement | null | undefined>();
  const bareStyle = $derived(`--collapsible-panel-height:auto;--collapsible-panel-width:auto;${typeof authoredStyle === 'string' ? authoredStyle : Object.entries(authoredStyle ?? {}).filter(([, value]) => value !== undefined).map(([key, value]) => `${key.startsWith('--') ? key : key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}:${value}`).join(';')}`);
  onMount(() => {
    hydrated = true;
    const browser = window as Window & { dimensionsWitness?: {
      setStyle(style: typeof authoredStyle): void; setOpen(value: boolean): void;
      replace(): void; mount(value: boolean): void; ref(): HTMLElement | null | undefined;
    } };
    browser.dimensionsWitness = {
      setStyle: value => flushSync(() => authoredStyle = value),
      setOpen: value => flushSync(() => open = value),
      replace: () => flushSync(() => hostTag = hostTag === 'div' ? 'section' : 'div'),
      mount: value => flushSync(() => shown = value), ref: () => ref,
    };
    return () => { delete browser.dimensionsWitness; };
  });
</script>
<svelte:head>
  <style>
    .dimensions-panel { width:200px; overflow:hidden; height:var(--collapsible-panel-height); transition:height 123ms linear; }
    .dimensions-panel[data-starting-style], .dimensions-panel[data-ending-style] { height:0; }
    .dimensions-content { height:40px; width:200px; }
  </style>
</svelte:head>
{#snippet host(props: Record<string | symbol, unknown>, _state: CollapsiblePanelState, children: Snippet | undefined)}
  <svelte:element this={hostTag} {...props as HTMLAttributes<HTMLElement>}>{@render children?.()}</svelte:element>
{/snippet}
<main data-hydrated={hydrated}>
  {#if shown}
    {#if bare}
      {#if forwarded}
        <svelte:element this={hostTag} data-testid="dimensions-panel" style={bareStyle} bind:this={ref} hidden={open ? false : 'until-found'}>
          <div class="dimensions-content">Native content</div>
        </svelte:element>
      {:else}
        <div data-testid="dimensions-panel" style={bareStyle} bind:this={ref} hidden={open ? false : 'until-found'}><div class="dimensions-content">Native content</div></div>
      {/if}
    {:else}
      <Collapsible.Root {open} onOpenChange={value => open = value}>
        <Collapsible.Trigger>Toggle dimensions</Collapsible.Trigger>
        <Collapsible.Panel data-testid="dimensions-panel" class="dimensions-panel" style={authoredStyle}
          hiddenUntilFound keepMounted render={forwarded ? host : undefined} bind:ref>
          <div class="dimensions-content">Native content</div>
        </Collapsible.Panel>
      </Collapsible.Root>
    {/if}
  {/if}
</main>
