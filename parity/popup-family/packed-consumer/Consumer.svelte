<script lang="ts">
  // Authored public-family fixture; supplement only, zero unchanged Original credit.
  import { untrack } from 'svelte';
  import { Popover, PreviewCard, Tooltip } from '@sveltery/base';
  import { Popover as SubPopover } from '@sveltery/base/popover';
  import { PreviewCard as SubPreviewCard } from '@sveltery/base/preview-card';
  import { Tooltip as SubTooltip } from '@sveltery/base/tooltip';
  import type { PopoverRootChangeEventDetails } from '@sveltery/base';
  import type { PreviewCardRootChangeEventDetails } from '@sveltery/base';
  import type { TooltipRootChangeEventDetails } from '@sveltery/base';
  let { family = 'popover', mode = 'ordinary', defaultOpen = false, keepMounted = false, cancel = '', delay = 0, closeDelay = 0, disabled = false, trackCursorAxis = 'none', modal = false, log = () => {} }: {
    family?: 'popover' | 'preview-card' | 'tooltip'; mode?: string; defaultOpen?: boolean; keepMounted?: boolean; cancel?: string; delay?: number; closeDelay?: number; disabled?: boolean; trackCursorAxis?: 'none' | 'x' | 'y' | 'both'; modal?: boolean | 'trap-focus'; log?: (kind: string, value: unknown, reason?: string, triggerId?: string) => void;
  } = $props();
  let hosts = $state<Record<string, HTMLElement | null | undefined>>({});
  const popover = Popover.createHandle<number>();
  const previewCard = PreviewCard.createHandle<number>();
  const tooltip = Tooltip.createHandle<number>();
  let popoverActions = $state<Popover.Root.Actions | null>(null);
  let previewCardActions = $state<PreviewCard.Root.Actions | null>(null);
  let tooltipActions = $state<Tooltip.Root.Actions | null>(null);
  let controlledOpen = $state(untrack(() => defaultOpen));
  let triggerId = $state<string | null | undefined>();
  function onOpenChange(open: boolean, details: PopoverRootChangeEventDetails | PreviewCardRootChangeEventDetails | TooltipRootChangeEventDetails) {
    if (mode === 'retain' && !open) details.preventUnmountOnClose();
    if ((open && cancel === 'open') || (!open && cancel === 'close')) details.cancel();
    if (mode === 'controlled' && !details.isCanceled) { controlledOpen = open; triggerId = details.trigger?.id ?? null; }
    log('open', open, details.reason, details.trigger?.id);
  }
  export function command(value: string) {
    const handle = family === 'popover' ? popover : family === 'preview-card' ? previewCard : tooltip;
    const actions = family === 'popover' ? popoverActions : family === 'preview-card' ? previewCardActions : tooltipActions;
    if (value === 'open') handle.open('opener');
    if (value === 'second') handle.open('second');
    if (value === 'close') actions?.close();
    if (value === 'unmount') actions?.unmount();
    if (value === 'controlled-open') { triggerId = 'opener'; controlledOpen = true; }
    if (value === 'controlled-close') controlledOpen = false;
  }
  export function snapshot() {
    const handle = family === 'popover' ? popover : family === 'preview-card' ? previewCard : tooltip;
    return { isOpen: handle.isOpen, actions: !!(family === 'popover' ? popoverActions : family === 'preview-card' ? previewCardActions : tooltipActions) };
  }
  const explicitOptional: Popover.Positioner.Props = { anchor: undefined, positionMethod: undefined, side: undefined, sideOffset: undefined, align: undefined, alignOffset: undefined, collisionBoundary: undefined, collisionPadding: undefined, arrowPadding: undefined, sticky: undefined, disableAnchorTracking: undefined, collisionAvoidance: undefined, children: undefined, ref: undefined, render: undefined, style: undefined, class: undefined };
  void [explicitOptional, hosts];
</script>
<button id="before">Before</button>
{#if family === 'popover'}
  {#if mode === 'detached'}
    <Popover.Trigger bind:ref={hosts.popoverTrigger} handle={popover} payload={7} id="opener" {delay} {closeDelay} {disabled}>Open</Popover.Trigger>
      <Popover.Trigger bind:ref={hosts.popoverTrigger} handle={popover} payload={9} id="second" {delay} {closeDelay} {disabled}>Second</Popover.Trigger>
  {/if}
  <Popover.Root handle={popover} {defaultOpen} defaultTriggerId={defaultOpen ? 'opener' : undefined} open={mode === 'controlled' ? controlledOpen : undefined} triggerId={mode === 'controlled' ? triggerId : undefined} bind:actions={popoverActions} {onOpenChange} onOpenChangeComplete={open => log('complete', open)} {modal}>
    {#snippet children({ payload })}
      {#if mode !== 'detached'}
        <Popover.Trigger bind:ref={hosts.popoverTrigger} handle={popover} payload={7} id="opener" {delay} {closeDelay} openOnHover={mode === 'hover'} {disabled}>Open</Popover.Trigger>
      <Popover.Trigger bind:ref={hosts.popoverTrigger} handle={popover} payload={9} id="second" {delay} {closeDelay} openOnHover={mode === 'hover'} {disabled}>Second</Popover.Trigger>
      {/if}
      <Popover.Portal bind:ref={hosts.popoverPortal} {keepMounted}>
        <Popover.Backdrop bind:ref={hosts.popoverBackdrop} data-testid="backdrop" />
        <Popover.Positioner bind:ref={hosts.popoverPositioner} data-testid="positioner" collisionAvoidance={{ side: 'none', align: 'none' }}>
          <Popover.Popup bind:ref={hosts.popoverPopup} data-testid="popup">
            <Popover.Arrow bind:ref={hosts.popoverArrow} data-testid="arrow" />
            <Popover.Title bind:ref={hosts.popoverTitle} id="title">Popup title</Popover.Title>
            <Popover.Description bind:ref={hosts.popoverDescription} id="description">Popup description</Popover.Description>
            {#if mode === 'viewport'}
              <Popover.Viewport bind:ref={hosts.popoverViewport} data-testid="viewport"><output id="payload">Content {payload ?? 'none'}</output><button id="inside">Inside</button></Popover.Viewport>
            {:else}
              <output id="payload">Content {payload ?? 'none'}</output><button id="inside">Inside</button>
            {/if}
            <Popover.Close bind:ref={hosts.popoverClose} id="close">Close</Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    {/snippet}
  </Popover.Root>
{:else if family === 'preview-card'}
  {#if mode === 'detached'}
    <PreviewCard.Trigger bind:ref={hosts.previewcardTrigger} handle={previewCard} payload={7} id="opener" {delay} {closeDelay} href="#popup">Open</PreviewCard.Trigger>
      <PreviewCard.Trigger bind:ref={hosts.previewcardTrigger} handle={previewCard} payload={9} id="second" {delay} {closeDelay} href="#popup">Second</PreviewCard.Trigger>
  {/if}
  <PreviewCard.Root handle={previewCard} {defaultOpen} defaultTriggerId={defaultOpen ? 'opener' : undefined} open={mode === 'controlled' ? controlledOpen : undefined} triggerId={mode === 'controlled' ? triggerId : undefined} bind:actions={previewCardActions} {onOpenChange} onOpenChangeComplete={open => log('complete', open)}>
    {#snippet children({ payload })}
      {#if mode !== 'detached'}
        <PreviewCard.Trigger bind:ref={hosts.previewcardTrigger} handle={previewCard} payload={7} id="opener" {delay} {closeDelay} href="#popup">Open</PreviewCard.Trigger>
      <PreviewCard.Trigger bind:ref={hosts.previewcardTrigger} handle={previewCard} payload={9} id="second" {delay} {closeDelay} href="#popup">Second</PreviewCard.Trigger>
      {/if}
      <PreviewCard.Portal bind:ref={hosts.previewcardPortal} {keepMounted}>
        <PreviewCard.Backdrop bind:ref={hosts.previewcardBackdrop} data-testid="backdrop" />
        <PreviewCard.Positioner bind:ref={hosts.previewcardPositioner} data-testid="positioner" collisionAvoidance={{ side: 'none', align: 'none' }}>
          <PreviewCard.Popup bind:ref={hosts.previewcardPopup} data-testid="popup">
            <PreviewCard.Arrow bind:ref={hosts.previewcardArrow} data-testid="arrow" />
            {#if mode === 'viewport'}
              <PreviewCard.Viewport bind:ref={hosts.previewcardViewport} data-testid="viewport"><output id="payload">Content {payload ?? 'none'}</output><button id="inside">Inside</button></PreviewCard.Viewport>
            {:else}
              <output id="payload">Content {payload ?? 'none'}</output><button id="inside">Inside</button>
            {/if}
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    {/snippet}
  </PreviewCard.Root>
{:else if family === 'tooltip'}
  <Tooltip.Provider {delay} {closeDelay}>
  {#if mode === 'detached'}
    <Tooltip.Trigger bind:ref={hosts.tooltipTrigger} handle={tooltip} payload={7} id="opener" {delay} {closeDelay} {disabled}>Open</Tooltip.Trigger>
      <Tooltip.Trigger bind:ref={hosts.tooltipTrigger} handle={tooltip} payload={9} id="second" {delay} {closeDelay} {disabled}>Second</Tooltip.Trigger>
  {/if}
  <Tooltip.Root handle={tooltip} {defaultOpen} defaultTriggerId={defaultOpen ? 'opener' : undefined} open={mode === 'controlled' ? controlledOpen : undefined} triggerId={mode === 'controlled' ? triggerId : undefined} bind:actions={tooltipActions} {onOpenChange} onOpenChangeComplete={open => log('complete', open)} {disabled} {trackCursorAxis}>
    {#snippet children({ payload })}
      {#if mode !== 'detached'}
        <Tooltip.Trigger bind:ref={hosts.tooltipTrigger} handle={tooltip} payload={7} id="opener" {delay} {closeDelay} {disabled}>Open</Tooltip.Trigger>
      <Tooltip.Trigger bind:ref={hosts.tooltipTrigger} handle={tooltip} payload={9} id="second" {delay} {closeDelay} {disabled}>Second</Tooltip.Trigger>
      {/if}
      <Tooltip.Portal bind:ref={hosts.tooltipPortal} {keepMounted}>
        <Tooltip.Positioner bind:ref={hosts.tooltipPositioner} data-testid="positioner" collisionAvoidance={{ side: 'none', align: 'none' }}>
          <Tooltip.Popup bind:ref={hosts.tooltipPopup} data-testid="popup">
            <Tooltip.Arrow bind:ref={hosts.tooltipArrow} data-testid="arrow" />
            {#if mode === 'viewport'}
              <Tooltip.Viewport bind:ref={hosts.tooltipViewport} data-testid="viewport"><output id="payload">Content {payload ?? 'none'}</output><button id="inside">Inside</button></Tooltip.Viewport>
            {:else}
              <output id="payload">Content {payload ?? 'none'}</output><button id="inside">Inside</button>
            {/if}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    {/snippet}
  </Tooltip.Root>
  </Tooltip.Provider>
{/if}
<button id="outside">Outside</button>

<SubPopover.Root><SubPopover.Trigger>Subpath popover</SubPopover.Trigger></SubPopover.Root>
<SubPreviewCard.Root><SubPreviewCard.Trigger href={null}>Subpath preview card</SubPreviewCard.Trigger></SubPreviewCard.Root>
<SubTooltip.Root><SubTooltip.Trigger>Subpath tooltip</SubTooltip.Trigger></SubTooltip.Root>
