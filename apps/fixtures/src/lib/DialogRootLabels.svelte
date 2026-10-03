<script lang="ts">
  import * as Dialog from '../../../../packages/base/src/lib/dialog/index.js';
  let phase = $state(0);
</script>
{#if phase < 2}
  {#key phase}<Dialog.Title>Title {phase + 1}</Dialog.Title><Dialog.Description>Description {phase + 1}</Dialog.Description>{/key}
{/if}
<button type="button" onclick={() => { phase++; }}>Change labels</button>
