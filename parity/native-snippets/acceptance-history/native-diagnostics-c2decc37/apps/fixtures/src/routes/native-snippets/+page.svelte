<script lang="ts">
  import OutroFixture from '../../lib/NativeButtonOutroFixture.svelte';
  import Fixture from '../../lib/NativeSnippetFixture.svelte';
  let { data } = $props();
</script>

{#if data.buttonOutro}
  <OutroFixture />
{:else}
  <Fixture />
{/if}
