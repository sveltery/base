<script lang="ts">
  // Authored public-family fixture; supplement only, zero unchanged Original credit.
  import { untrack } from 'svelte';
  import * as Popover from '../../src/lib/popover/index.js';
  import * as PreviewCard from '../../src/lib/preview-card/index.js';
  import * as Tooltip from '../../src/lib/tooltip/index.js';
  import type { PopoverRootChangeEventDetails } from '../../src/lib/popover/types.js';
  import type { PreviewCardRootChangeEventDetails } from '../../src/lib/preview-card/types.js';
  import type { TooltipRootChangeEventDetails } from '../../src/lib/tooltip/types.js';
  let {
    family = 'popover',
    mode = 'ordinary',
    defaultOpen = false,
    keepMounted = false,
    cancel = '',
    delay = 0,
    closeDelay = 0,
    disabled = false,
    trackCursorAxis = 'none',
    modal = false,
    log = () => {},
  }: {
    family?: 'popover' | 'preview-card' | 'tooltip';
    mode?: string;
    defaultOpen?: boolean;
    keepMounted?: boolean;
    cancel?: string;
    delay?: number;
    closeDelay?: number;
    disabled?: boolean;
    trackCursorAxis?: 'none' | 'x' | 'y' | 'both';
    modal?: boolean | 'trap-focus';
    log?: (kind: string, value: unknown, reason?: string, triggerId?: string) => void;
  } = $props();
  const popover = Popover.createHandle<number>();
  const previewCard = PreviewCard.createHandle<number>();
  const tooltip = Tooltip.createHandle<number>();
  let popoverActions = $state<Popover.Root.Actions | null>(null);
  let previewCardActions = $state<PreviewCard.Root.Actions | null>(null);
  let tooltipActions = $state<Tooltip.Root.Actions | null>(null);
  let controlledOpen = $state(untrack(() => defaultOpen));
  let triggerId = $state<string | null | undefined>();
  function onOpenChange(
    open: boolean,
    details:
      | PopoverRootChangeEventDetails
      | PreviewCardRootChangeEventDetails
      | TooltipRootChangeEventDetails,
  ) {
    if (mode === 'retain' && !open) details.preventUnmountOnClose();
    if ((open && cancel === 'open') || (!open && cancel === 'close')) details.cancel();
    if (mode === 'controlled' && !details.isCanceled) {
      controlledOpen = open;
      triggerId = details.trigger?.id ?? null;
    }
    log('open', open, details.reason, details.trigger?.id);
  }
  export function command(value: string) {
    const handle =
      family === 'popover' ? popover : family === 'preview-card' ? previewCard : tooltip;
    const actions =
      family === 'popover'
        ? popoverActions
        : family === 'preview-card'
          ? previewCardActions
          : tooltipActions;
    if (value === 'open') handle.open('opener');
    if (value === 'second') handle.open('second');
    if (value === 'close') actions?.close();
    if (value === 'unmount') actions?.unmount();
    if (value === 'controlled-open') {
      triggerId = 'opener';
      controlledOpen = true;
    }
    if (value === 'controlled-close') controlledOpen = false;
  }
  export function snapshot() {
    const handle =
      family === 'popover' ? popover : family === 'preview-card' ? previewCard : tooltip;
    return {
      isOpen: handle.isOpen,
      actions: !!(family === 'popover'
        ? popoverActions
        : family === 'preview-card'
          ? previewCardActions
          : tooltipActions),
    };
  }
</script>

<button id="before">Before</button>
{#if family === 'popover'}
  {#if mode === 'detached'}
    <Popover.Trigger handle={popover} payload={7} id="opener" {delay} {closeDelay} {disabled}
      >Open</Popover.Trigger
    >
    <Popover.Trigger handle={popover} payload={9} id="second" {delay} {closeDelay} {disabled}
      >Second</Popover.Trigger
    >
  {/if}
  <Popover.Root
    handle={popover}
    {defaultOpen}
    defaultTriggerId={defaultOpen ? 'opener' : undefined}
    open={mode === 'controlled' ? controlledOpen : undefined}
    triggerId={mode === 'controlled' ? triggerId : undefined}
    bind:actions={popoverActions}
    {onOpenChange}
    onOpenChangeComplete={(open) => log('complete', open)}
    {modal}
  >
    {#snippet children({ payload })}
      {#if mode !== 'detached'}
        <Popover.Trigger
          handle={popover}
          payload={7}
          id="opener"
          {delay}
          {closeDelay}
          openOnHover={mode === 'hover'}
          {disabled}>Open</Popover.Trigger
        >
        <Popover.Trigger
          handle={popover}
          payload={9}
          id="second"
          {delay}
          {closeDelay}
          openOnHover={mode === 'hover'}
          {disabled}>Second</Popover.Trigger
        >
      {/if}
      <Popover.Portal {keepMounted}>
        <Popover.Backdrop data-testid="backdrop" />
        <Popover.Positioner
          data-testid="positioner"
          collisionAvoidance={{ side: 'none', align: 'none' }}
        >
          <Popover.Popup data-testid="popup">
            <Popover.Arrow data-testid="arrow" />
            <Popover.Title id="title">Popup title</Popover.Title>
            <Popover.Description id="description">Popup description</Popover.Description>
            {#if mode === 'viewport'}
              <Popover.Viewport data-testid="viewport"
                ><output id="payload">Content {payload ?? 'none'}</output><button id="inside"
                  >Inside</button
                ></Popover.Viewport
              >
            {:else}
              <output id="payload">Content {payload ?? 'none'}</output><button id="inside"
                >Inside</button
              >
            {/if}
            <Popover.Close id="close">Close</Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    {/snippet}
  </Popover.Root>
{:else if family === 'preview-card'}
  {#if mode === 'detached'}
    <PreviewCard.Trigger
      handle={previewCard}
      payload={7}
      id="opener"
      {delay}
      {closeDelay}
      href="#popup">Open</PreviewCard.Trigger
    >
    <PreviewCard.Trigger
      handle={previewCard}
      payload={9}
      id="second"
      {delay}
      {closeDelay}
      href="#popup">Second</PreviewCard.Trigger
    >
  {/if}
  <PreviewCard.Root
    handle={previewCard}
    {defaultOpen}
    defaultTriggerId={defaultOpen ? 'opener' : undefined}
    open={mode === 'controlled' ? controlledOpen : undefined}
    triggerId={mode === 'controlled' ? triggerId : undefined}
    bind:actions={previewCardActions}
    {onOpenChange}
    onOpenChangeComplete={(open) => log('complete', open)}
  >
    {#snippet children({ payload })}
      {#if mode !== 'detached'}
        <PreviewCard.Trigger
          handle={previewCard}
          payload={7}
          id="opener"
          {delay}
          {closeDelay}
          href="#popup">Open</PreviewCard.Trigger
        >
        <PreviewCard.Trigger
          handle={previewCard}
          payload={9}
          id="second"
          {delay}
          {closeDelay}
          href="#popup">Second</PreviewCard.Trigger
        >
      {/if}
      <PreviewCard.Portal {keepMounted}>
        <PreviewCard.Backdrop data-testid="backdrop" />
        <PreviewCard.Positioner
          data-testid="positioner"
          collisionAvoidance={{ side: 'none', align: 'none' }}
        >
          <PreviewCard.Popup data-testid="popup">
            <PreviewCard.Arrow data-testid="arrow" />
            {#if mode === 'viewport'}
              <PreviewCard.Viewport data-testid="viewport"
                ><output id="payload">Content {payload ?? 'none'}</output><button id="inside"
                  >Inside</button
                ></PreviewCard.Viewport
              >
            {:else}
              <output id="payload">Content {payload ?? 'none'}</output><button id="inside"
                >Inside</button
              >
            {/if}
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    {/snippet}
  </PreviewCard.Root>
{:else if family === 'tooltip'}
  <Tooltip.Provider {delay} {closeDelay}>
    {#if mode === 'detached'}
      <Tooltip.Trigger handle={tooltip} payload={7} id="opener" {delay} {closeDelay} {disabled}
        >Open</Tooltip.Trigger
      >
      <Tooltip.Trigger handle={tooltip} payload={9} id="second" {delay} {closeDelay} {disabled}
        >Second</Tooltip.Trigger
      >
    {/if}
    <Tooltip.Root
      handle={tooltip}
      {defaultOpen}
      defaultTriggerId={defaultOpen ? 'opener' : undefined}
      open={mode === 'controlled' ? controlledOpen : undefined}
      triggerId={mode === 'controlled' ? triggerId : undefined}
      bind:actions={tooltipActions}
      {onOpenChange}
      onOpenChangeComplete={(open) => log('complete', open)}
      {disabled}
      {trackCursorAxis}
    >
      {#snippet children({ payload })}
        {#if mode !== 'detached'}
          <Tooltip.Trigger handle={tooltip} payload={7} id="opener" {delay} {closeDelay} {disabled}
            >Open</Tooltip.Trigger
          >
          <Tooltip.Trigger handle={tooltip} payload={9} id="second" {delay} {closeDelay} {disabled}
            >Second</Tooltip.Trigger
          >
        {/if}
        <Tooltip.Portal {keepMounted}>
          <Tooltip.Positioner
            data-testid="positioner"
            collisionAvoidance={{ side: 'none', align: 'none' }}
          >
            <Tooltip.Popup data-testid="popup">
              <Tooltip.Arrow data-testid="arrow" />
              {#if mode === 'viewport'}
                <Tooltip.Viewport data-testid="viewport"
                  ><output id="payload">Content {payload ?? 'none'}</output><button id="inside"
                    >Inside</button
                  ></Tooltip.Viewport
                >
              {:else}
                <output id="payload">Content {payload ?? 'none'}</output><button id="inside"
                  >Inside</button
                >
              {/if}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      {/snippet}
    </Tooltip.Root>
  </Tooltip.Provider>
{/if}
<button id="outside">Outside</button>
