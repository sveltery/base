<script lang="ts">
  import { Meter } from '../../src/lib/meter/index.js';
  let first = $state(true), value = $state(50), explicit = $state<string | undefined>('second');
  export function removeFirst() { first = false; }
  export function change() { value = NaN; }
  export function generatedLabel() { explicit = undefined; }
</script>
<Meter.Root value={value} id="outer">
  {#if first}<Meter.Label id="first">First</Meter.Label>{/if}
  <Meter.Label id={explicit} data-testid="second-label">Second</Meter.Label>
  <Meter.Value id="outer-value"/>
  <Meter.Root value={100} id="inner"><Meter.Label id="inner-label">Inner</Meter.Label><Meter.Value id="inner-value"/></Meter.Root>
</Meter.Root>
