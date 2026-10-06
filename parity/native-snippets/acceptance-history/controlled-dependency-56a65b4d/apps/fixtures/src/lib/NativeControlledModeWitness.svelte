<script lang="ts">
  // Native state-owner baseline; actual canonical Utils class, no Base component.
  import { Controlled } from '@sveltery/utils/Controlled';
  let ownerOpen = $state<boolean | undefined>(false);
  const initialDefault = true;
  const state = new Controlled(() => ownerOpen, initialDefault);
  const open = $derived(state.value);
  let requests = $state<{ open: boolean; before: boolean }[]>([]);
  function request() {
    const next = !open;
    requests = [...requests, { open: next, before: open }];
    state.set(next);
  }
</script>

<section data-testid="native-controlled-mode">
  <button type="button" onclick={() => (ownerOpen = undefined)}
    >Native release controlled value</button
  >
  <button type="button" aria-expanded={open} onclick={request}>Native request toggle</button>
  {#if open}<div data-testid="native-controlled-content">Native controlled content</div>{/if}
  <output data-testid="native-controlled-requests">{JSON.stringify(requests)}</output>
</section>
