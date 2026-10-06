<script lang="ts">
  import OutroFixture from '../../lib/NativeButtonOutroFixture.svelte';
  import Fixture from '../../lib/NativeSnippetFixture.svelte';
  import StyleWitness from '../../lib/NativeCollapsibleStyleWitness.svelte';
  import ControlledWitness from '../../lib/NativeControlledModeWitness.svelte';
  let { data } = $props();
</script>

{#if data.buttonOutro}
  <OutroFixture />
{:else}
  <Fixture />
  <StyleWitness />
  <ControlledWitness />
{/if}
