<script lang="ts">
  import { untrack } from 'svelte';
  import { useOpenChangeComplete } from '../../src/lib/internals/useOpenChangeComplete.svelte.js';
  let {
    finished,
    initialBatch,
    record,
    queried,
  }: {
    finished: Promise<void>;
    initialBatch: boolean;
    record: (channel: string) => void;
    queried: () => void;
  } = $props();
  let batch = $state(untrack(() => initialBatch));
  let enabled = $state(true);
  let element: HTMLDivElement | null = null;
  const ref = {
    get current() {
      return element;
    },
  };
  export function setBatch(value: boolean) {
    batch = value;
  }
  function attach(node: HTMLDivElement) {
    element = node;
    Object.defineProperty(node, 'getAnimations', {
      value: () => {
        queried();
        return [{ playState: 'running', finished }];
      },
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

<div {@attach attach}></div><output data-status>{enabled ? 'enabled' : 'disabled'}</output><output
  data-batch>{String(batch)}</output
>
