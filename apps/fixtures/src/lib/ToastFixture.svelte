<script lang="ts">
  import { Toast } from '@sveltery/base';
  import { onMount, untrack } from 'svelte';
  import ToastLifecycleContents from './ToastLifecycleContents.svelte';
  import ToastContents from './ToastContents.svelte';
  import ToastProviderContents from './ToastProviderContents.svelte';
  let { scenario }: { scenario: string } = $props();
  let hydrated = $state(false);
  let timeout = $state(5000);
  let limit = $state(untrack(() => scenario === 'limit-sync' || scenario === 'limited-upsert' ? 1 : scenario === 'limit' || scenario === 'unlimit' ? 2 : 3));
  const manager = Toast.createToastManager();
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  {#if scenario === 'lifecycle' || scenario === 'lifecycle-limit'}
    <Toast.Provider toastManager={manager} limit={scenario === 'lifecycle-limit' ? 1 : 3}><ToastLifecycleContents external={manager} /></Toast.Provider>
  {:else if scenario === 'isolation'}
    <Toast.Provider><ToastProviderContents label="first" title="First toast" /></Toast.Provider>
    <Toast.Provider><ToastProviderContents label="second" title="Second toast" /></Toast.Provider>
  {:else}
    <Toast.Provider {timeout} {limit} toastManager={scenario.startsWith('manager-') ? manager : undefined}>
      <ToastContents {scenario} api={scenario.startsWith('manager-') ? manager : undefined} setTimeoutOption={value => { timeout = value; }} setLimit={value => { limit = value; }} />
    </Toast.Provider>
  {/if}
</main>
<style>
  main { padding: 24px; }
  :global([data-testid="viewport"]) { display: flex; flex-direction: column; gap: 8px; width: 320px; }
  :global([data-testid="viewport"] > div) { padding: 8px; border: 1px solid #999; }
  :global(button) { margin: 4px; }
</style>
