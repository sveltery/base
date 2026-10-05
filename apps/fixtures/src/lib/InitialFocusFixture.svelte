<script lang="ts">
  // Fixture topology derived from Base UI v1.8.0 DialogPopup.test.tsx:92,287,310,333.
  // MIT attribution: parity/dialog/UPSTREAM_LICENSE.
  import { Dialog } from '@sveltery/base';
  import { onMount } from 'svelte';
  let {
    scenario,
    record = (_count: number) => {},
  }: { scenario: string; record?: (count: number) => void } = $props();
  const input2Ref: { current: HTMLInputElement | null } = { current: null };
  let calls = $state(0);
  let hydrated = $state(false);
  // The attachment populates a stable, nonreactive ref before queued focus entry.
  function inputRef(node: HTMLInputElement) {
    input2Ref.current = node;
    return () => {
      if (input2Ref.current === node) input2Ref.current = null;
    };
  }
  function getRef() {
    calls += 1;
    record(calls);
    return input2Ref.current;
  }
  const initialFocus = $derived(
    scenario === 'ref'
      ? input2Ref
      : scenario === 'true'
        ? () => true
        : scenario === 'null'
          ? () => null
          : getRef,
  );
  onMount(() => {
    hydrated = true;
  });
</script>

<main data-hydrated={hydrated}>
  {#if scenario === 'ref'}<input />{/if}
  <Dialog.Root modal={false}>
    <Dialog.Trigger>Open</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Popup data-testid="dialog" {initialFocus}>
        <input data-testid="input-1" />
        {#if scenario === 'ref' || scenario === 'count'}<input
            data-testid="input-2"
            {@attach inputRef}
          />{/if}
        {#if scenario === 'ref'}<input data-testid="input-3" /><button>Close</button>{/if}
        {#if scenario === 'count'}<Dialog.Close>Close</Dialog.Close>{/if}
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
  {#if scenario === 'ref'}<input />{/if}
  <output data-testid="focus-calls">{calls}</output>
</main>
