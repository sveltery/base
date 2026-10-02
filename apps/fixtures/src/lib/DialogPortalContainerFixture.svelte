<script lang="ts">
  import { onMount } from 'svelte';
  import { Dialog } from '@sveltery/base';
  import { createPortalContainer } from './dialog-portal-container.js';
  let {scenario}: {scenario: string} = $props();
  let ready = $state(false);
  let container = $state.raw<ReturnType<typeof createPortalContainer>['container']>();
  let show = $state(true);
  onMount(() => { const result = createPortalContainer(scenario); container = result.container; ready = true; return result.cleanup; });
</script>
<main data-hydrated={ready}>
  {#if ready && show}<Dialog.Root defaultOpen modal={false}><Dialog.Portal {container} data-testid="container-portal"><span>Child</span></Dialog.Portal></Dialog.Root>{/if}
  <button onclick={() => show = false}>Remove portal</button>
</main>
