<script lang="ts">
  import { NumberField } from '../../src/lib/number-field/index.js';
  import type { HTMLProps } from '../../src/lib/internals/types.js';
  let stage = $state(1);
  let nativeButton = $state(true);
  let host = $state<HTMLElement | null>();
  export function publishReplacement() {
    stage = 2;
  }
  export function disposeOutgoing() {
    stage = 3;
  }
  export function requireNativeHost() {
    nativeButton = true;
  }
  export function requireNonNativeHost() {
    nativeButton = false;
  }
  export function currentHost() {
    return host;
  }
</script>

<NumberField.Root defaultValue={2} locale="en-US">
  <NumberField.Input />
  <NumberField.Increment {nativeButton} bind:ref={host} render={replacement} />
</NumberField.Root>
{#snippet replacement(props: HTMLProps)}
  {#if stage < 3}<button {...props} data-host="A">Outgoing increase</button>{/if}
  {#if stage > 1}<button {...props} data-host="B">Replacement increase</button>{/if}
{/snippet}
