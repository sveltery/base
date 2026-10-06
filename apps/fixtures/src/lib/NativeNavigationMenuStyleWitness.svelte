<script lang="ts">
  // Literal native Svelte control: no Base components, helpers or assertion credit.
  import { onMount } from 'svelte';
  let attributeHost = $state<HTMLDivElement>();
  let spreadHost = $state<HTMLDivElement>();
  let phase = $state(0);
  let hydrated = $state(false);
  const style = $derived(
    `color:${phase === 0 ? 'red' : 'blue'};${phase === 2 ? 'pointer-events:auto;--popup-width:375px;--popup-height:160px;--positioner-width:375px;--positioner-height:160px;' : ''}`,
  );
  const props = $derived({ style });
  onMount(() => {
    hydrated = true;
  });
  function writeImperative() {
    for (const host of [attributeHost, spreadHost]) {
      if (!host) throw new Error('Literal native style host is missing');
      host.style.pointerEvents = 'auto';
      host.style.setProperty('--popup-width', '250px');
      host.style.setProperty('--popup-height', '120px');
      host.style.setProperty('--positioner-width', '250px');
      host.style.setProperty('--positioner-height', '120px');
    }
  }
</script>

<section data-testid="bare-style-witness" data-hydrated={hydrated} data-phase={phase}>
  <div data-testid="bare-attribute-host" bind:this={attributeHost} {style}></div>
  <div data-testid="bare-spread-host" bind:this={spreadHost} {...props}></div>
  <button type="button" data-testid="bare-write" onclick={writeImperative}
    >Write imperative values</button
  >
  <button
    type="button"
    data-testid="bare-update"
    onclick={() => {
      phase = 1;
    }}>Update native style</button
  >
  <button
    type="button"
    data-testid="bare-author"
    onclick={() => {
      phase = 2;
    }}>Author later values</button
  >
</section>
