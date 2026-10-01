<script lang="ts">
  import * as Dialog from '../../src/lib/dialog/index.js';
  let { firstOpen = false, secondOpen = false }: { firstOpen?: boolean; secondOpen?: boolean } = $props();
</script>
<Dialog.Root defaultOpen={firstOpen} defaultTriggerId="first-trigger" modal={false}>
  <Dialog.Trigger id="first-trigger">First</Dialog.Trigger>
  <Dialog.Title>First title</Dialog.Title>
  <Dialog.Portal><Dialog.Popup>First popup</Dialog.Popup></Dialog.Portal>
</Dialog.Root>
<Dialog.Root defaultOpen={secondOpen} defaultTriggerId="second-trigger" modal={false}>
  <Dialog.Trigger id="second-trigger">Second</Dialog.Trigger>
  <Dialog.Title>Second title</Dialog.Title>
  <Dialog.Portal><Dialog.Popup>Second popup</Dialog.Popup></Dialog.Portal>
</Dialog.Root>
