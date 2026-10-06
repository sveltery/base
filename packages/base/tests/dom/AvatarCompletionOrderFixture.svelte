<script lang="ts">
  // Bounded leased animation-pair regression from accepted Dialog f0d68ec7 (MIT).
  // Base UI v1.8.0 pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; zero Avatar ordinary credit.
  import { useOpenChangeComplete } from '../../src/lib/internals/useOpenChangeComplete.svelte.js';
  let {
    finished,
    batch,
    record,
  }: { finished: Promise<void>; batch: boolean; record: (channel: string) => void } = $props();
  let enabled = $state(true);
  let element: HTMLDivElement | null = null;
  const ref = {
    get current() {
      return element;
    },
  };
  function attach(node: HTMLDivElement) {
    element = node;
    Object.defineProperty(node, 'getAnimations', {
      value: () => [{ playState: 'running', finished }],
    });
    return () => {
      element = null;
    };
  }
  useOpenChangeComplete({
    open: false,
    ref,
    get batch() {
      return batch;
    },
    onComplete() {
      record('owner');
      enabled = false;
    },
  });
  useOpenChangeComplete({
    get enabled() {
      return enabled;
    },
    open: false,
    ref,
    get batch() {
      return batch;
    },
    onComplete() {
      record('dependent');
    },
  });
</script>

<div {@attach attach}></div><output>{enabled ? 'enabled' : 'disabled'}</output>
