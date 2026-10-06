<script lang="ts">
  import { onMount, mount } from 'svelte';
  import MeterFixture from '../../lib/MeterFixture.svelte';
  import MeterConformanceFixture from '../../lib/MeterConformanceFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  let error = $state('');
  let contextReady = $state(false);
  onMount(() => {
    if (data.scenario === 'context' && !data.reference && host) {
      void import('../../../../../packages/base/src/lib/meter/index.js').then(({ Label }) => {
        try {
          mount(Label, { target: host! });
        } catch (caught) {
          error = (caught as Error).message;
        }
        contextReady = true;
      });
      return;
    }
    if (!data.reference || !host) return;
    const node = host;
    let stopped = false;
    let cleanup: (() => void) | undefined;
    void import('../../lib/meter-reference.js').then(({ mountMeterReference }) => {
      if (!stopped) cleanup = mountMeterReference(node, data.scenario, data.part, data.mode);
    });
    return () => {
      stopped = true;
      cleanup?.();
    };
  });
</script>

{#if data.scenario === 'context' && !data.reference}<main data-hydrated={contextReady}
    ><div bind:this={host}></div><output data-testid="context-error">{error}</output></main
  >{:else if data.reference}<div bind:this={host}
  ></div>{:else if data.scenario === 'conformance' || data.scenario === 'standalone-track'}<MeterConformanceFixture
    part={data.part}
    mode={data.mode}
    standalone={data.scenario === 'standalone-track'}
  />{:else}<MeterFixture scenario={data.scenario} />{/if}
