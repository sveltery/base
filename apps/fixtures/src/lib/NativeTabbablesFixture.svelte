<script lang="ts">
  // Supplemental native keyboard audit; no upstream Dialog declaration credit.
  import { onMount } from 'svelte';
  import { Dialog } from '@sveltery/base';
  import { mountNativeTabbables } from './native-tabbables-content.js';
  let { scenario }: { scenario: string } = $props();
  let hydrated = $state(false);
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  <Dialog.Root>
    <Dialog.Trigger>Open native dialog</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Popup>
        <Dialog.Title>Native tab stops</Dialog.Title>
        <Dialog.Close id="native-close">Close</Dialog.Close>
        <div {@attach node => mountNativeTabbables(node, scenario)}></div>
      </Dialog.Popup>
    </Dialog.Portal>
  </Dialog.Root>
</main>
