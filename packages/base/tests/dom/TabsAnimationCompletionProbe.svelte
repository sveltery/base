<script lang="ts">
  // Native used-helper lifecycle supplement; no ordinary Source assertion credit.
  import { onMount } from 'svelte';
  import { useOpenChangeComplete } from '../../src/lib/internals/useOpenChangeComplete.svelte.js';
  let {
    finished,
    batch,
    onComplete,
  }: { finished: Promise<void>; batch: boolean; onComplete: () => void } = $props();
  let element = $state<HTMLDivElement | null>(null);
  let armed = $state(false);
  const ref = {
    get current() {
      return element;
    },
  };
  useOpenChangeComplete({
    ref,
    get enabled() {
      return armed;
    },
    open: false,
    get batch() {
      return batch;
    },
    onComplete: () => onComplete(),
  });
  onMount(() => {
    Object.defineProperty(element, 'getAnimations', {
      value: () => [{ finished, pending: false, playState: 'finished' }],
    });
    armed = true;
  });
</script>

<div bind:this={element}></div>
