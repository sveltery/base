<script lang="ts">
  import { Dialog } from '@sveltery/base';
  import { onMount } from 'svelte';
  let hydrated = $state(false);
  onMount(() => {
    hydrated = true;
  });
</script>

<main data-hydrated={hydrated}>
  <Dialog.Root>
    <Dialog.Trigger>First open</Dialog.Trigger>
    <Dialog.Title>First title</Dialog.Title>
    <Dialog.Description>First description</Dialog.Description>
    <Dialog.Portal><Dialog.Popup>First popup</Dialog.Popup></Dialog.Portal>
  </Dialog.Root>
  <Dialog.Root>
    <Dialog.Trigger>Second open</Dialog.Trigger>
    <Dialog.Title>Second title</Dialog.Title>
    <Dialog.Description>Second description</Dialog.Description>
    <Dialog.Portal><Dialog.Popup>Second popup</Dialog.Popup></Dialog.Portal>
  </Dialog.Root>
</main>
