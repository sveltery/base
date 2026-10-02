<script lang="ts">
  import { onMount } from 'svelte';
  import { CSPProvider } from '@sveltery/base';
  import { CSPProvider as SubpathProvider } from '@sveltery/base/csp-provider';
  import CSPProbe from './CSPProbe.svelte';
  let nonce = $state<string | undefined>('outer-a');
  let disabled = $state<boolean | undefined>(true);
  let shown = $state(true);
  let hydrated = $state(false);
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  <button onclick={() => { nonce = 'outer-b'; disabled = false; }}>Update</button>
  <button onclick={() => { nonce = undefined; disabled = undefined; }}>Clear</button>
  <button onclick={() => { shown = !shown; }}>Toggle provider</button>
  <CSPProbe name="outside" />
  {#if shown}
    <CSPProvider {nonce} disableStyleElements={disabled}>
      <CSPProbe name="outer" />
      <SubpathProvider><CSPProbe name="inner-omitted" /></SubpathProvider>
      <SubpathProvider nonce="inner" disableStyleElements={false}><CSPProbe name="inner-explicit" /></SubpathProvider>
      <CSPProbe name="outer-sibling" />
    </CSPProvider>
  {:else}<CSPProbe name="unwrapped" />{/if}
  <CSPProbe name="after" />
</main>
