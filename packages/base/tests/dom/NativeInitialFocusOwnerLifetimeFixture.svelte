<!-- Authored public native initial-focus lifetime supplement; zero Original declaration credit. -->
<script lang="ts">
  import { Popover } from '@sveltery/base/popover';
  import type { PopoverRootChangeEventDetails } from '../../src/lib/popover/types.js';

  let {
    report,
    reportInitialTarget,
    portalContainer,
  }: {
    report: (open: boolean, details: PopoverRootChangeEventDetails) => void;
    reportInitialTarget: (target: HTMLElement | null) => void;
    portalContainer: HTMLElement;
  } = $props();
  let popupVisible = $state(false);
  let initialTarget = $state<HTMLButtonElement | null>(null);

  function initialFocus() {
    reportInitialTarget(initialTarget);
    return initialTarget;
  }
</script>

<button id="initial-focus-outside">Outside popover</button>
<Popover.Root defaultOpen modal={false} onOpenChange={report}>
  <Popover.Trigger id="initial-focus-trigger">Popover</Popover.Trigger>
  <Popover.Portal container={portalContainer} keepMounted>
    <Popover.Positioner data-testid="initial-focus-positioner">
      <button id="initial-focus-target" bind:this={initialTarget}>Retained initial target</button>
      <button id="show-initial-focus-owner" onclick={() => (popupVisible = true)}>Show popup</button
      >
      <button id="remove-initial-focus-owner" onclick={() => (popupVisible = false)}
        >Remove popup</button
      >
      {#if popupVisible}
        <Popover.Popup data-testid="initial-focus-popup" {initialFocus} finalFocus={false}>
          <button>Popup content</button>
        </Popover.Popup>
      {/if}
    </Popover.Positioner>
  </Popover.Portal>
</Popover.Root>
