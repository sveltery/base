<script lang="ts">
  // Native renderer witness, not an upstream assertion port. Zero ordinary credit.
  import { untrack } from 'svelte';
  import { useControlled } from '../../../src/lib/utils/useControlled.svelte.js';
  import { useStableCallback } from '../../../src/lib/utils/useStableCallback.js';
  let { scenario, canonical = false }: { scenario: string; canonical?: boolean } = $props();
  let ownerOpen = $state<boolean | undefined>(untrack(() => scenario === 'controlled-consumer' ? false : undefined));
  let localOpen = $state(false), switched = $state(false);
  const control = untrack(() => canonical) ? useControlled(() => ({ controlled: ownerOpen, default: false, name: 'Native boundary' })) : undefined;
  const open = $derived(control ? control[0]() : ownerOpen ?? localOpen);
  const events: boolean[] = [], callbackOwners: string[] = [];
  function oldChanged(next: boolean) { callbackOwners.push('old'); events.push(next); }
  function newChanged(next: boolean) { callbackOwners.push('new'); events.push(next); }
  const callback = $derived(switched ? newChanged : oldChanged);
  function request() {
    const next = !open;
    callback(next);
    if (control) control[1](next); else if (ownerOpen === undefined) localOpen = next;
  }
  const stableRequest = untrack(() => canonical) ? useStableCallback(request) : request;
  function click() {
    if (scenario === 'controlled-consumer') ownerOpen = true;
    if (scenario === 'callback-snapshot') switched = true;
    stableRequest();
  }
  export function snapshot() { return { events, callbackOwners }; }
</script>
<button id="tested-trigger" aria-expanded={open} onclick={click}>Native control</button>
