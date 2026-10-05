<script lang="ts">
  import { Button } from '../../src/lib/button/index.js';

  let activations = $state(0);
  let disabled = $state(false);
  let visible = $state(true);
  let ref = $state<HTMLElement | null>();
</script>

{#if visible}
  <Button {disabled} bind:ref onclick={() => activations++}
    >Public action</Button
  >
{/if}
<button type="button" onclick={() => (disabled = true)}>Disable action</button>
<button type="button" onclick={() => (visible = false)}>Remove action</button>
<output aria-label="Activations">{activations}</output>
<output aria-label="Bound host">{ref?.tagName ?? 'none'}</output>
