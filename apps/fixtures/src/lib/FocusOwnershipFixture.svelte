<script lang="ts">
  // Supplemental audit regressions; no upstream leaf credit.
  import { onMount } from 'svelte';
  import { Dialog } from '@sveltery/base';
  import type { Actions, ChangeEventDetails } from '@sveltery/base/dialog';
  let { scenario }: { scenario: string } = $props();
  let hydrated = $state(false);
  let portalVisible = $state(true);
  let popupVisible = $state(true);
  let actions = $state<Actions | null>(null);
  let requests = $state<{ open: boolean; reason: string; trigger: string | null }[]>([]);
  let returns = $state(0);
  const modal = $derived(scenario !== 'triggers' && !scenario.endsWith('external-focus'));
  const target = $derived(
    scenario === 'external-focus' || scenario === 'default-detach'
      ? undefined
      : scenario === 'boolean-external-focus'
        ? true
        : finalFocus,
  );
  function change(open: boolean, details: ChangeEventDetails) {
    requests.push({ open, reason: details.reason, trigger: details.trigger?.id ?? null });
  }
  function finalFocus() {
    returns += 1;
    if (scenario === 'final-false') return false;
    if (scenario === 'final-none') return undefined;
    return document.getElementById('focus-a');
  }
  function commands(node: HTMLElement) {
    const host = node as HTMLElement & {
      removeDialogPart?: () => void;
      closeDialog?: () => void;
      closeAndRemove?: () => void;
    };
    const remove = () => {
      if (scenario === 'popup-detach') popupVisible = false;
      else portalVisible = false;
    };
    host.removeDialogPart = remove;
    host.closeDialog = () => actions?.close();
    host.closeAndRemove = () => {
      actions?.close();
      remove();
    };
    return () => {
      delete host.removeDialogPart;
      delete host.closeDialog;
      delete host.closeAndRemove;
    };
  }
  onMount(() => {
    hydrated = true;
  });
</script>

<main data-hydrated={hydrated} {@attach commands}>
  <button id="outside">Outside</button>
  <Dialog.Root
    {modal}
    disablePointerDismissal={scenario.endsWith('external-focus')}
    bind:actions
    onOpenChange={change}
  >
    <Dialog.Trigger id="focus-a"><span>Trigger A</span></Dialog.Trigger>
    <Dialog.Trigger id="focus-b"><span>Trigger B</span></Dialog.Trigger>
    {#if portalVisible}<Dialog.Portal
        >{#if popupVisible}
          <Dialog.Popup finalFocus={target} style="position:relative;z-index:1">
            {#if scenario.startsWith('radio')}
              <input
                aria-label="First radio"
                id="radio-first"
                type="radio"
                name="choice'quoted"
                tabindex={scenario.endsWith('negative') ? -1 : undefined}
                checked={scenario === 'radio' || scenario === 'radio-negative'}
              />
              <input
                aria-label="Second radio"
                id="radio-second"
                type="radio"
                name="choice'quoted"
              />
            {:else}
              <input aria-label="Inside" />
              <Dialog.Close>Close</Dialog.Close>
            {/if}
          </Dialog.Popup>
        {/if}</Dialog.Portal
      >{/if}
  </Dialog.Root>
  <output data-testid="requests">{JSON.stringify(requests)}</output>
  <output data-testid="returns">{returns}</output>
</main>
