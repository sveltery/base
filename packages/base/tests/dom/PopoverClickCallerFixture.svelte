<script lang="ts">
  // Real Popover caller lifetime supplement; pin47b40521, zero ordinary assertion credit.
  import { flushSync } from 'svelte';
  import * as Popover from '../../src/lib/popover/index.js';
  const first = Popover.createHandle();
  const second = Popover.createHandle();
  let selected = $state.raw(first);
  const changes: { owner: string; open: boolean }[] = [];
  export function snapshot() {
    return changes;
  }
</script>

<Popover.Trigger
  handle={selected}
  id="caller-trigger"
  onclick={() =>
    flushSync(() => {
      selected = second;
    })}>Switch handle during click</Popover.Trigger
>
<Popover.Root
  handle={first}
  onOpenChange={(open) => {
    changes.push({ owner: 'first', open });
  }}
>
  <Popover.Portal
    ><Popover.Positioner
      ><Popover.Popup data-testid="first-popup">First owner</Popover.Popup></Popover.Positioner
    ></Popover.Portal
  >
</Popover.Root>
<Popover.Root
  handle={second}
  onOpenChange={(open) => {
    changes.push({ owner: 'second', open });
  }}
>
  <Popover.Portal
    ><Popover.Positioner
      ><Popover.Popup data-testid="second-popup">Second owner</Popover.Popup></Popover.Positioner
    ></Popover.Portal
  >
</Popover.Root>
