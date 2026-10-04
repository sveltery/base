<script lang="ts">
  // Authored fixture source assertions: parity/scroll-area/original-assertions.json; MIT.
  import { flushSync, onMount, untrack } from 'svelte';
  import { ScrollArea, DirectionProvider, CSPProvider } from '@sveltery/base';
  import type { HTMLAttributes } from 'svelte/elements';
  import { defaultScrollAreaOptions, type ScrollAreaOptions } from './scroll-area-harness.js';
  let { options = {} }: { options?: Partial<ScrollAreaOptions> } = $props();
  let settings = $state<ScrollAreaOptions>(untrack(() => ({ ...defaultScrollAreaOptions, ...options })));
  let mounted = $state(true);
  let hydrated = $state(false);
  let rootRef = $state<HTMLElement | null>(null);
  let viewportRef = $state<HTMLElement | null>(null);
  let contentRef = $state<HTMLElement | null>(null);
  let verticalRef = $state<HTMLElement | null>(null);
  let horizontalRef = $state<HTMLElement | null>(null);
  let thumbRef = $state<HTMLElement | null>(null);
  let cornerRef = $state<HTMLElement | null>(null);
  const calls = $state<string[]>([]);
  function consumer(name: string, event: Event & { preventBaseUIHandler?: () => void }) {
    calls.push(name);
    if (settings.suppress === name) event.preventBaseUIHandler?.();
    if (settings.unmountOn === name) flushSync(() => {
      if (name === 'scroll' || name === 'up') settings.viewportMounted = false;
      else settings.scrollbarMounted = false;
    });
  }
  onMount(() => {
    hydrated = true;
    window.scrollAreaHarness = {
      configure(patch) { flushSync(() => { settings = { ...settings, ...patch }; }); },
      destroy() { flushSync(() => { mounted = false; }); },
      refs() { return { root: rootRef !== null, viewport: viewportRef !== null, content: contentRef !== null, vertical: verticalRef !== null, horizontal: horizontalRef !== null, thumb: thumbRef !== null, corner: cornerRef !== null }; },
    };
    return () => { delete window.scrollAreaHarness; };
  });
</script>
{#snippet replacement(props: HTMLAttributes<HTMLElement>, _state: object, children: import('svelte').Snippet | undefined)}
  {#if settings.dropRef && (props['data-testid'] === 'content' || props['data-testid'] === 'vertical')}
    <article {...Object.fromEntries(Object.entries(props))}>{@render children?.()}</article>
  {:else}
    <article {...props}>{@render children?.()}</article>
  {/if}
{/snippet}
<main data-hydrated={hydrated} data-renderer="svelte">
  <button id="outside">outside focus</button>
  <output id="calls">{JSON.stringify(calls)}</output>
  {#if mounted}
    <DirectionProvider direction={settings.direction}>
      <CSPProvider nonce={settings.nonce} disableStyleElements={settings.disableStyleElements}>
        <div style:display={settings.hidden ? 'none' : undefined}>
          <ScrollArea.Root data-testid="root" bind:ref={rootRef} overflowEdgeThreshold={settings.threshold} render={settings.customRender ? replacement : undefined} class="root-class" style={{ width: `${settings.viewportSize}px`, height: `${settings.viewportSize}px`, direction: settings.direction }}>
            {#if settings.viewportMounted}
              <ScrollArea.Viewport data-testid="viewport" bind:ref={viewportRef} render={settings.customRender ? replacement : undefined} onscroll={(event) => consumer('scroll', event)} style={{ width: '100%', height: '100%', scrollSnapType: settings.snap, pointerEvents: 'none' }}>
                {#if settings.contentMounted}
                  <ScrollArea.Content data-testid="content" bind:ref={contentRef} render={settings.customRender ? replacement : undefined}>
                    {#if settings.snapItems}
                      <div style="display:flex">{#each Array.from({ length: 10 }) as _, index (index)}<div style="flex-shrink:0;width:200px;height:100px;scroll-snap-align:start"></div>{/each}</div>
                    {:else}<div data-testid="large" style:width={`${settings.contentWidth}px`} style:height={`${settings.contentHeight}px`}></div>{/if}
                  </ScrollArea.Content>
                {/if}
              </ScrollArea.Viewport>
            {/if}
            {#if settings.scrollbarMounted}
              <ScrollArea.Scrollbar orientation="vertical" data-testid="vertical" bind:ref={verticalRef} render={settings.customRender ? replacement : undefined} keepMounted={settings.keepMounted} {...(settings.ariaOverride ? { 'aria-hidden': undefined } : {})} onpointerdown={(event) => consumer('track', event)} style={{ width: `${settings.trackThickness}px`, display: 'flex', paddingBlock: `${settings.padding}px`, marginInline: `${settings.margin}px`, ...(settings.trackHeight !== null ? { height: `${settings.trackHeight}px`, bottom: 'auto' } : {}) }}>
                {#if settings.thumbMounted}<ScrollArea.Thumb data-testid="vertical-thumb" bind:ref={thumbRef} render={settings.customRender ? replacement : undefined} onpointerdown={(event) => consumer('down', event)} onpointermove={(event) => consumer('move', event)} onpointerup={(event) => consumer('up', event)} style={{ width: '100%', marginBlock: `${settings.thumbMargin}px` }} />{/if}
              </ScrollArea.Scrollbar>
              <ScrollArea.Scrollbar orientation="horizontal" data-testid="horizontal" bind:ref={horizontalRef} render={settings.customRender ? replacement : undefined} keepMounted={settings.keepMounted} {...(settings.ariaOverride ? { 'aria-hidden': undefined } : {})} style={{ height: `${settings.trackThickness}px`, display: 'flex', paddingInline: `${settings.padding}px`, marginBlock: `${settings.margin}px` }}>
                {#if settings.thumbMounted}<ScrollArea.Thumb data-testid="horizontal-thumb" render={settings.customRender ? replacement : undefined} style={{ height: '100%', marginInline: `${settings.thumbMargin}px` }} />{/if}
              </ScrollArea.Scrollbar>
            {/if}
            {#if settings.cornerMounted}<ScrollArea.Corner data-testid="corner" bind:ref={cornerRef} render={settings.customRender ? replacement : undefined} {...(settings.ariaOverride ? { 'aria-hidden': undefined } : {})} />{/if}
          </ScrollArea.Root>
        </div>
        {#if settings.repeated}<ScrollArea.Root data-testid="second-root" style={{width:'200px',height:'200px'}}><ScrollArea.Viewport data-testid="second-viewport" style={{width:'100%',height:'100%'}}><ScrollArea.Content><div style="width:1000px;height:1000px"></div></ScrollArea.Content></ScrollArea.Viewport></ScrollArea.Root>{/if}
      </CSPProvider>
    </DirectionProvider>
  {/if}
</main>
