<script lang="ts">
  import * as Dialog from '../../src/lib/dialog/index.js';
</script>

<Dialog.Root defaultOpen>
  <Dialog.Portal>
    <Dialog.Backdrop
      data-testid="state-backdrop"
      class={(state) => Object.keys(state).sort().join(' ')}
    />
    <Dialog.Popup>Dialog</Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
