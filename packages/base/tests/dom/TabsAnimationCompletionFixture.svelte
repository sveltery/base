<script lang="ts">
  import Probe from './TabsAnimationCompletionProbe.svelte';
  let { finished, firstBatch, secondBatch }: { finished: Promise<void>; firstBatch: boolean; secondBatch: boolean } = $props();
  let showSecond = $state(true);
  const calls: string[] = [];
  export function getCalls() { return [...calls]; }
</script>
<Probe {finished} batch={firstBatch} onComplete={() => { calls.push('first'); showSecond = false; }} />
{#if showSecond}<Probe {finished} batch={secondBatch} onComplete={() => { calls.push('second'); }} />{/if}
