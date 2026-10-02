<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import DirectionProvider from '../../../../packages/base/src/lib/direction-provider/DirectionProvider.svelte';
  import Probe from './AnchorPositioningProbe.svelte';
  let { scenario = 'default' }: { scenario?: string } = $props();
  let hydrated = $state(false);
  let open = $state(untrack(() => scenario !== 'closed'));
  let direction = $state<'ltr' | 'rtl'>(untrack(() => scenario === 'logical' ? 'rtl' : 'ltr'));
  let domDirection = $state<'ltr' | 'rtl'>(untrack(() => scenario === 'rtl' || scenario === 'mismatch' ? 'rtl' : 'ltr'));
  let sideOffset = $state(0);
  let replacement = $state(false);
  let wide = $state(false);
  let shown = $state(true);
  let realArrow = $state(untrack(() => scenario === 'arrow'));
  onMount(() => { hydrated = true; });
</script>

<main class="anchor-positioning" data-hydrated={hydrated}>
  <button onclick={() => open = !open}>Toggle open</button>
  <button onclick={() => sideOffset = 12}>Set offset</button>
  <button onclick={() => direction = direction === 'ltr' ? 'rtl' : 'ltr'}>Toggle provider direction</button>
  <button onclick={() => domDirection = domDirection === 'ltr' ? 'rtl' : 'ltr'}>Toggle DOM direction</button>
  <button onclick={() => replacement = !replacement}>Replace anchor</button>
  <button onclick={() => wide = !wide}>Resize anchor</button>
  <button onclick={() => realArrow = !realArrow}>Toggle arrow</button>
  <button onclick={() => shown = !shown}>Toggle foundation</button>
  <DirectionProvider {direction}>
    {#if shown}<Probe {scenario} {open} {domDirection} {sideOffset} {replacement} {wide} {realArrow} />{/if}
  </DirectionProvider>
</main>
