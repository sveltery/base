<script lang="ts">
  import { Progress } from '../../src/lib/progress/index.js';
  let first = $state(true),
    value = $state<number | null>(50);
  export function removeFirst() {
    first = false;
  }
  export function change() {
    value = null;
  }
</script>

<Progress.Root {value} id="outer">
  {#if first}<Progress.Label id="first">First</Progress.Label>{/if}
  <Progress.Label id="second">Second</Progress.Label>
  <Progress.Value id="outer-value" />
  <Progress.Root value={100} id="inner"
    ><Progress.Label id="inner-label">Inner</Progress.Label><Progress.Value
      id="inner-value"
    /></Progress.Root
  >
</Progress.Root>
