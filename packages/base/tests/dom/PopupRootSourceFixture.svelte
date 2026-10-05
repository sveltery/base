<script lang="ts">
  // Pinned complete contained/detached/multiple-detached regular Root setup adaptations.
  // MIT; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; parity/popup-family/UPSTREAM_LICENSE.
  import { untrack } from 'svelte';
  import * as Popover from '../../src/lib/popover/index.js';
  import * as PreviewCard from '../../src/lib/preview-card/index.js';
  import * as Tooltip from '../../src/lib/tooltip/index.js';
  let { family, arrangement = 'contained', open, defaultOpen = false, delay, closeDelay, controlledSync = false, openOnHover = false, keepMounted = false, disabled = false, rootDisabled = false, triggerDisabled, mutableDisabled = false, disableHoverablePopup = false, trackCursorAxis = 'none', closePart = false, triggerId = 'trigger', onOpenChange = () => {}, onPreviousOpen = () => {}, onOpenChangeComplete = () => {}, preventFirstUnmount = false, preventEveryUnmount = false }: {
    family: 'popover' | 'preview-card' | 'tooltip'; arrangement?: 'contained' | 'detached' | 'multiple-detached'; open?: boolean | undefined; defaultOpen?: boolean; delay?: number | undefined; closeDelay?: number | undefined;
    controlledSync?: boolean; openOnHover?: boolean; keepMounted?: boolean; disabled?: boolean;
    rootDisabled?: boolean; triggerDisabled?: boolean | undefined; mutableDisabled?: boolean; disableHoverablePopup?: boolean; trackCursorAxis?: 'none' | 'x' | 'y' | 'both'; closePart?: boolean; triggerId?: string;
    onOpenChange?: (open: boolean, details: Popover.PopoverRootChangeEventDetails | PreviewCard.PreviewCardRootChangeEventDetails | Tooltip.TooltipRootChangeEventDetails) => void;
    onPreviousOpen?: (open: boolean) => void; onOpenChangeComplete?: (open: boolean) => void; preventFirstUnmount?: boolean; preventEveryUnmount?: boolean;
  } = $props();
  const popover = Popover.createHandle();
  const previewCard = PreviewCard.createHandle();
  const tooltip = Tooltip.createHandle();
  let actions = $state<Popover.Root.Actions | null>(null);
  let controlledOpen = $state(untrack(() => open ?? false));
  let rootDisabledState = $state(untrack(() => rootDisabled));
  let preventNext = untrack(() => preventFirstUnmount);
  function change(next: boolean, details: Popover.PopoverRootChangeEventDetails | PreviewCard.PreviewCardRootChangeEventDetails | Tooltip.TooltipRootChangeEventDetails) {
    if (!next && (preventEveryUnmount || preventNext)) { details.preventUnmountOnClose(); preventNext = false; }
    onOpenChange(next, details);
    if (controlledSync) { onPreviousOpen(controlledOpen); controlledOpen = next; }
  }
  export function close() { actions?.close(); }
  export function unmountPopup() { actions?.unmount(); }
  export function openExternally() { controlledOpen = true; }
  export function snapshot() {
    const store = family === 'popover' ? popover.store : family === 'preview-card' ? previewCard.store : tooltip.store;
    const floating = store.state.floatingRootContext;
    const positioned = floating.context.dataRef.current.floatingContext;
    const positioner = document.querySelector('[data-testid=positioner]');
    return { open: store.state.open, activeTriggerId: store.state.activeTriggerId, referenceIsActual: floating.state.domReferenceElement === document.getElementById('trigger'), positionerElementIsActual: store.state.positionerElement === positioner, floatingStoreElementIsActual: floating.state.floatingElement === positioner, floatingElementIsPositioner: positioned?.elements.floating === positioner };
  }
</script>
{#snippet popoverTrigger(detached: boolean)}
  <Popover.Trigger id={triggerId} data-testid="trigger" handle={detached ? popover : undefined} {delay} {closeDelay} {openOnHover} {disabled}>{family === 'preview-card' ? 'Link' : 'Toggle'}</Popover.Trigger>
  {#if arrangement === 'multiple-detached'}<Popover.Trigger id="trigger-2" data-testid="trigger-2" handle={popover}>Toggle another</Popover.Trigger>{/if}
{/snippet}
{#snippet previewCardTrigger(detached: boolean)}
  <PreviewCard.Trigger id="trigger" data-testid="trigger" handle={detached ? previewCard : undefined} {delay} {closeDelay} href="#">{family === 'preview-card' ? 'Link' : 'Toggle'}</PreviewCard.Trigger>
  {#if arrangement === 'multiple-detached'}<PreviewCard.Trigger id="trigger-2" data-testid="trigger-2" handle={previewCard} href="#">Another link</PreviewCard.Trigger>{/if}
{/snippet}
{#snippet tooltipTrigger(detached: boolean)}
  <Tooltip.Trigger id="trigger" data-testid="trigger" handle={detached ? tooltip : undefined} {delay} {closeDelay} disabled={triggerDisabled}>{family === 'preview-card' ? 'Link' : 'Toggle'}</Tooltip.Trigger>
  {#if arrangement === 'multiple-detached'}<Tooltip.Trigger id="trigger-2" data-testid="trigger-2" handle={tooltip}>Toggle another</Tooltip.Trigger>{/if}
{/snippet}
{#snippet popoverRoot()}
  <Popover.Root handle={arrangement === 'contained' ? undefined : popover} open={controlledSync ? controlledOpen : open} {defaultOpen} bind:actions onOpenChange={change} {onOpenChangeComplete}>
    {#if arrangement === 'contained'}{@render popoverTrigger(false)}{/if}
    <Popover.Portal {keepMounted}><Popover.Positioner data-testid="positioner"><Popover.Popup data-testid="popup">{#if closePart}<Popover.Close data-testid="close" id="close-button">Close</Popover.Close>{:else}Content{/if}</Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>
{/snippet}
{#snippet previewCardRoot()}
  <PreviewCard.Root handle={arrangement === 'contained' ? undefined : previewCard} open={controlledSync ? controlledOpen : open} {defaultOpen} bind:actions onOpenChange={change} {onOpenChangeComplete}>
    {#if arrangement === 'contained'}{@render previewCardTrigger(false)}{/if}
    <PreviewCard.Portal {keepMounted}><PreviewCard.Positioner data-testid="positioner"><PreviewCard.Popup data-testid="popup">Content</PreviewCard.Popup></PreviewCard.Positioner></PreviewCard.Portal>
  </PreviewCard.Root>
{/snippet}
{#snippet tooltipRoot()}
  <Tooltip.Root handle={arrangement === 'contained' ? undefined : tooltip} open={controlledSync ? controlledOpen : open} {defaultOpen} bind:actions onOpenChange={change} {onOpenChangeComplete} disabled={rootDisabledState} {disableHoverablePopup} {trackCursorAxis}>
    {#if arrangement === 'contained'}{@render tooltipTrigger(false)}{/if}
    <Tooltip.Portal {keepMounted}><Tooltip.Positioner data-testid="positioner"><Tooltip.Popup data-testid="popup">Content</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
  </Tooltip.Root>
{/snippet}
{#if family === 'popover'}
  {#if arrangement !== 'contained'}{@render popoverTrigger(true)}{/if}
  {@render popoverRoot()}
{:else if family === 'preview-card'}
  {#if arrangement !== 'contained'}{@render previewCardTrigger(true)}{/if}
  {@render previewCardRoot()}
{:else if family === 'tooltip'}
  {#if arrangement !== 'contained'}{@render tooltipTrigger(true)}{/if}
  {@render tooltipRoot()}
{/if}
{#if mutableDisabled}<button data-testid="disabled" aria-label="Disable tooltip" onclick={() => { rootDisabledState = true; }}></button>{/if}
