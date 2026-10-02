<script lang="ts">
  // Native Svelte reset comparators; supplemental evidence, no upstream declaration credit.
  import { flushSync, onMount } from 'svelte';
  import { Input } from '@sveltery/base/input';
  let { native = false, scenario = 'reassociation', canceled = false }: { native?: boolean; scenario?: string; canceled?: boolean } = $props();
  let form = $state('reset-first'); let hydrated = $state(false);
  onMount(() => { hydrated = true; });
  function reset(event: Event & { currentTarget: HTMLInputElement }) {
    if (scenario === 'reassociation' || scenario === 'unrelated-old') { form = 'reset-second'; flushSync(); }
    const resetForm = scenario === 'unrelated-old' ? event.currentTarget.ownerDocument.getElementById('reset-first') as HTMLFormElement : event.currentTarget.form;
    resetForm?.reset();
  }
  function observeReset(event: Event) {
    if (canceled) event.preventDefault();
    if (scenario === 'stop-immediate') event.stopImmediatePropagation();
  }
</script>
<main data-hydrated={hydrated}>
  <form id="reset-first" onreset={observeReset}></form>
  <form id="reset-second" onreset={observeReset}></form>
  {#if native}<input {form} value="owner" defaultValue="seed" oninput={reset} data-testid="reset-input" />
  {:else}<Input {form} value="owner" defaultValue="seed" oninput={reset} data-testid="reset-input" />{/if}
</main>
