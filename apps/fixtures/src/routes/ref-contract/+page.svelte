<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/RefContractFixture.svelte';
  let { data } = $props();
  let hydrated = $state(false);
  let fixture = $state<ReturnType<typeof Fixture>>();
  onMount(() => {
    hydrated = true;
  });
</script>

<main data-hydrated={hydrated}>
  <Fixture bind:this={fixture} {...data} />
  <output data-testid="ref-state"
    >{fixture?.getRef() === undefined
      ? 'undefined'
      : fixture.getRef() === null
        ? 'null'
        : fixture.getRef()?.tagName}</output
  >
  <button onclick={() => fixture?.hide()}>Remove component</button>
</main>
