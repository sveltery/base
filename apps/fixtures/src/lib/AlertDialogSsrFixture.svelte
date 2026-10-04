<script lang="ts">
  // Native SSR/hydration whole-component supplement over actual public parts.
  import { onMount } from 'svelte';
  import { AlertDialog } from '@sveltery/base';
  let { handle = AlertDialog.createHandle<number>() }: { handle?: AlertDialog.Handle<number> } = $props();
  let hydrated = $state(false);
  onMount(() => { hydrated = true; });
</script>
<main data-hydrated={hydrated}>
  <AlertDialog.Root {handle} defaultOpen>
    {#snippet children({ payload })}
      <output data-testid="ssr-payload">{payload ?? 'No payload'}</output>
      <AlertDialog.Portal><AlertDialog.Backdrop/><AlertDialog.Viewport>
        <AlertDialog.Popup><AlertDialog.Title>Hydrated confirmation</AlertDialog.Title><AlertDialog.Description>SSR anatomy</AlertDialog.Description><AlertDialog.Close>Close hydrated</AlertDialog.Close></AlertDialog.Popup>
      </AlertDialog.Viewport></AlertDialog.Portal>
    {/snippet}
  </AlertDialog.Root>
  <AlertDialog.Trigger {handle} data-testid="ssr-trigger" payload={7}>Hydrated trigger</AlertDialog.Trigger>
</main>
