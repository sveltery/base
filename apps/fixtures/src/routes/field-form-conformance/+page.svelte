<script lang="ts">
  import { onMount } from 'svelte';
  import Fixture from '../../lib/FieldFormConformanceFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  onMount(() => {
    if (!data.reference) return;
    let cleanup: (() => void) | undefined;
    let connected = true;
    void import('../../lib/field-form-conformance-reference.js').then(
      ({ mountFieldFormConformanceReference }) => {
        if (connected && host)
          cleanup = mountFieldFormConformanceReference(host, data.part, data.scenario);
      },
    );
    return () => {
      connected = false;
      cleanup?.();
    };
  });
</script>

{#if data.reference}<div bind:this={host}></div>{:else}<Fixture
    part={data.part}
    scenario={data.scenario}
  />{/if}
