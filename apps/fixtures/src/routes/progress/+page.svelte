<script lang="ts">
  import { onMount, mount } from 'svelte';
  import ProgressFixture from '../../lib/ProgressFixture.svelte';
  import ProgressConformanceFixture from '../../lib/ProgressConformanceFixture.svelte';
  let { data } = $props();
  let host = $state<HTMLDivElement>();
  let error = $state('');
  let contextReady = $state(false);
  onMount(() => {
    if (data.scenario === 'context' && !data.reference && host) {
      void import('../../../../../packages/base/src/lib/progress/index.js').then(({ Label }) => {
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
    void import('../../lib/progress-reference.js').then(({ mountProgressReference }) => {
      if (!stopped) cleanup = mountProgressReference(node, data.scenario, data.part, data.mode);
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
  ></div>{:else if data.scenario === 'conformance'}<ProgressConformanceFixture
    part={data.part}
    mode={data.mode}
  />{:else}<ProgressFixture scenario={data.scenario} />{/if}
