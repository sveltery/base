<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { DirectionProvider, type TextDirection } from '../../../../packages/base/src/lib/direction-provider/index.js';
  import DirectionProbe from './DirectionProbe.svelte';

  let { scenario = 'configured' }: { scenario?: string } = $props();
  let hydrated = $state(false);
  let direction = $state<TextDirection | undefined>(untrack(() => scenario === 'default' ? undefined : 'rtl'));
  let innerDirection = $state<TextDirection | undefined>(undefined);
  let shown = $state(true);
  onMount(() => { hydrated = true; });
  export function update(next: TextDirection | undefined) { direction = next; }
  export function updateInner(next: TextDirection | undefined) { innerDirection = next; }
  export function toggleInner() { shown = !shown; }
</script>

<main data-hydrated={hydrated}>
  <button onclick={() => update('ltr')}>Set LTR</button>
  <button onclick={() => update('rtl')}>Set RTL</button>
  <button onclick={() => update(undefined)}>Clear direction</button>
  <button onclick={() => updateInner('rtl')}>Set inner RTL</button>
  <button onclick={() => updateInner('ltr')}>Set inner LTR</button>
  <button onclick={() => updateInner(undefined)}>Clear inner direction</button>
  <button onclick={toggleInner}>Toggle inner</button>
  <section data-testid="provider-host">
    {#if scenario === 'outside'}
      <DirectionProbe />
    {:else if scenario === 'nested'}
      <DirectionProvider {direction}>
        <DirectionProbe id="outer-before" />
        {#if shown}
          <DirectionProvider direction={innerDirection}><DirectionProbe id="inner" /></DirectionProvider>
        {/if}
        <DirectionProbe id="outer-after" />
      </DirectionProvider>
      <DirectionProbe id="outside" />
    {:else}
      <DirectionProvider {direction}><DirectionProbe /></DirectionProvider>
    {/if}
  </section>
</main>
