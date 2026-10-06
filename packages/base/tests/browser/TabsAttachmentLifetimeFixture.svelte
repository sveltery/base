<script lang="ts">
  // Native host/outro witness; supplemental, zero unchanged Original assertion credit.
  import { Tabs } from '../../src/lib/tabs/index.js';
  let swapped = $state(false);
  let disabled = $state(false);
  let nativeButton = $state(true);
  let host = $state<HTMLElement | null>(null);
  let outroEnded = $state(false);
  function retainHost(_node: Element) {
    return { duration: 400 };
  }
  function disableCurrentHost() {
    if (host instanceof HTMLButtonElement) host.disabled = true;
    disabled = true;
  }
</script>

<button
  onclick={() => {
    swapped = true;
  }}>Replace host</button
>
<button onclick={disableCurrentHost}>Disable current host</button>
<button
  onclick={() => {
    nativeButton = false;
  }}>Change native expectation</button
>
<output aria-label="Outro ended">{String(outroEnded)}</output>
<output aria-label="Bound host">{host?.dataset.host ?? 'none'}</output>
<Tabs.Root defaultValue={0}>
  <Tabs.List>
    <Tabs.Tab value={0} {disabled} {nativeButton} bind:ref={host}>
      {#snippet render(props, _state, children)}
        {#if swapped}
          <button {...props} data-host="new">{@render children?.()}</button>
        {:else}
          <button
            {...props}
            data-host="old"
            out:retainHost
            onoutroend={() => {
              outroEnded = true;
            }}>{@render children?.()}</button
          >
        {/if}
      {/snippet}
      Current tab
    </Tabs.Tab>
  </Tabs.List>
</Tabs.Root>
