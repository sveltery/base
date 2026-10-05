<script lang="ts">
  import { onMount } from 'svelte';
  import type { TimingResult } from '../../lib/input-timing/types.js';
  let host = $state<HTMLElement>();
  let results = $state<TimingResult[]>([]);
  let complete = $state(false);
  onMount(() => {
    let stopped = false;
    void import('../../lib/input-timing/probe.js').then(async ({ probeInputTiming }) => {
      for (const framework of [
        'react',
        'input',
        'native-value',
        'native-bind',
        'native-bind-accessor',
        'input-final-wrapper',
        'input-owned-final-wrapper',
      ] as const)
        for (const decision of ['accept', 'reject', 'rewrite'] as const) {
          if (stopped || !host) return;
          results.push(await probeInputTiming(host, framework, decision));
        }
      for (const framework of ['react', 'input', 'input-owned-final-wrapper'] as const) {
        if (stopped || !host) return;
        results.push(await probeInputTiming(host, framework, 'reject', true));
      }
      complete = true;
    });
    return () => {
      stopped = true;
    };
  });
</script>

<main data-complete={complete}
  ><div bind:this={host}></div><output data-testid="timing-results"
    >{JSON.stringify(results)}</output
  ></main
>
