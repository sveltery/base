<script lang="ts">
  // Bare Svelte CSS-text transport witness. No component or ordinary parity credit.
  import { flushSync, onMount, untrack } from 'svelte';
  import { collapsibleConfig, collapsibleCss } from './collapsible-config.js';
  let { scenario }: { scenario: string } = $props();
  const config = untrack(() => collapsibleConfig(scenario));
  let node = $state<HTMLElement | null>(null),
    open = $state(false),
    starting = $state(false),
    shown = $state(true);
  let height = $state<number | undefined>(),
    width = $state<number | undefined>();
  let skip = false;
  let restoreDuration: (() => void) | undefined;
  const style = $derived(
    `--collapsible-panel-height:${height === undefined ? 'auto' : `${height}px`};--collapsible-panel-width:${width === undefined ? 'auto' : `${width}px`};${config.panelStyle}`,
  );
  function reveal(beforematch = false) {
    skip = beforematch;
    open = !open;
    starting = open;
  }
  $effect(() => {
    const nextOpen = open;
    if (!nextOpen || !node) return;
    return untrack(() => {
      const panel = node!;
      // Same concrete write -> real browser measure -> reactive CSS-text update
      // boundary, isolated from library control, transition and animation helpers.
      const original = Object.fromEntries(
        (scenario.includes('keys')
          ? []
          : ['justify-content', 'align-items', 'align-content', 'justify-items']
        ).map((key) => [key, panel.style.getPropertyValue(key)]),
      );
      for (const key of Object.keys(original)) panel.style.setProperty(key, 'initial', 'important');
      height = panel.scrollHeight;
      width = panel.scrollWidth;
      if (skip) {
        const property = scenario.includes('keys') ? 'animation-duration' : 'transition-duration';
        const previous = panel.style.getPropertyValue(property),
          priority = panel.style.getPropertyPriority(property);
        panel.style.setProperty(property, '0s');
        restoreDuration = () => {
          if (previous === '') panel.style.removeProperty(property);
          else panel.style.setProperty(property, previous, priority);
        };
      }
      const frame = requestAnimationFrame(() => {
        for (const [key, value] of Object.entries(original)) {
          if (value === '') panel.style.removeProperty(key);
          else panel.style.setProperty(key, value);
        }
        starting = false;
      });
      return () => {
        cancelAnimationFrame(frame);
        restoreDuration?.();
      };
    });
  });
  onMount(() => {
    const browser = window as Window & { collapsibleFlush?: (action: string) => void };
    browser.collapsibleFlush = (action) => flushSync(() => reveal(action === 'beforematch'));
    return () => {
      delete browser.collapsibleFlush;
      restoreDuration?.();
    };
  });
</script>

<!-- eslint-disable svelte/no-at-html-tags -- Fixed local fixture CSS only. -->
<svelte:head>{@html `<style>${collapsibleCss}</style>`}</svelte:head>
<main data-hydrated="true">
  <button id="tested-trigger" onclick={() => reveal()} aria-expanded={open}>Native reveal</button>
  {#snippet host(props: Record<string, unknown>)}<div {...props} bind:this={node}
      >This is panel content</div
    >{/snippet}
  <button onclick={() => (shown = !shown)}>Toggle mounting</button>
  {#if shown}
    {#if scenario.includes('forward')}
      {@render host({
        'data-testid': 'panel',
        class: config.motionClass,
        style,
        hidden: open ? false : config.hidden ? 'until-found' : true,
        'data-open': open ? '' : undefined,
        'data-closed': open ? undefined : '',
        'data-starting-style': starting ? '' : undefined,
      })}
    {:else}
      <div
        data-testid="panel"
        class={config.motionClass}
        {style}
        hidden={open ? false : config.hidden ? 'until-found' : true}
        data-open={open ? '' : undefined}
        data-closed={open ? undefined : ''}
        data-starting-style={starting ? '' : undefined}
        bind:this={node}>This is panel content</div
      >
    {/if}
  {/if}
</main>
