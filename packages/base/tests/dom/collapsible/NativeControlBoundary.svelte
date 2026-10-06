<script lang="ts">
  // Native renderer witness, not an upstream assertion port. Zero ordinary credit.
  import { untrack } from 'svelte';
  import { Controlled } from '@sveltery/utils/Controlled';
  let { scenario, canonical = false }: { scenario: string; canonical?: boolean } = $props();
  let ownerOpen = $state<boolean | undefined>(
    untrack(() => (scenario === 'controlled-consumer' ? false : undefined)),
  );
  let localOpen = $state(false),
    switched = $state(false);
  const control = untrack(() => canonical) ? new Controlled(() => ownerOpen, false) : undefined;
  const open = $derived(control ? control.value : (ownerOpen ?? localOpen));
  const events: boolean[] = [],
    callbackOwners: string[] = [];
  function oldChanged(next: boolean) {
    callbackOwners.push('old');
    events.push(next);
  }
  function newChanged(next: boolean) {
    callbackOwners.push('new');
    events.push(next);
  }
  const callback = $derived(switched ? newChanged : oldChanged);
  function request() {
    const next = !open;
    callback(next);
    if (control) control.set(next);
    else if (ownerOpen === undefined) localOpen = next;
  }
  function click() {
    if (scenario === 'controlled-consumer') ownerOpen = true;
    if (scenario === 'callback-snapshot') switched = true;
    request();
  }
  export function snapshot() {
    return { events, callbackOwners };
  }
</script>

<button id="tested-trigger" aria-expanded={open} onclick={click}>Native control</button>
