<script lang="ts">
  // Complete detached Root declaration setups adapted from the pinned MIT Source.
  // Pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; parity/popup-family/UPSTREAM_LICENSE.
  import * as Popover from '../../src/lib/popover/index.js';
  import * as PreviewCard from '../../src/lib/preview-card/index.js';
  import * as Tooltip from '../../src/lib/tooltip/index.js';
  let { family, popover, previewCard, tooltip, location = 'before', defaultOpen = false, defaultTriggerId, payloadContent = false, overlap = false, triggerCount = 2, singleId = 'trigger', onOpenChange = () => {} }: {
    family: 'popover' | 'preview-card' | 'tooltip'; popover: Popover.Handle<number>; previewCard: PreviewCard.Handle<number>; tooltip: Tooltip.Handle<number>;
    location?: 'before' | 'after' | 'inside'; defaultOpen?: boolean; defaultTriggerId?: string | undefined; payloadContent?: boolean; overlap?: boolean; triggerCount?: number; singleId?: string;
    onOpenChange?: (open: boolean, details: Popover.PopoverRootChangeEventDetails | PreviewCard.PreviewCardRootChangeEventDetails | Tooltip.TooltipRootChangeEventDetails) => void;
  } = $props();
  let mounted = $state(true);
  let firstVisible = $state(true);
  export function rootMounted(value: boolean) { mounted = value; }
  export function removeFirstTrigger() { firstVisible = false; }
</script>
<button type="button" id="initial">Initial focus</button>
{#snippet popoverTriggers()}
  {#each Array.from({ length: triggerCount }, (_, index) => index + 1) as payload (payload)}
    {#if payload !== 1 || firstVisible}
      <Popover.Trigger handle={popover} id={triggerCount === 1 ? singleId : `trigger-${payload}`} {payload} delay={0}>Trigger {triggerCount === 1 ? '' : payload}</Popover.Trigger>
    {/if}
  {/each}
{/snippet}
{#snippet popoverRoot()}
  {#if mounted}
    <Popover.Root handle={popover} {defaultOpen} {defaultTriggerId} {onOpenChange}>
      {#snippet children({ payload })}
        {#if location === 'inside'}{@render popoverTriggers()}{/if}
        <span data-testid="payload">{payload ?? 'No payload'}</span>
        <Popover.Portal>
          <Popover.Positioner data-testid="positioner">
            <Popover.Popup data-testid="content">{#if payloadContent}<span data-testid="content-payload">{payload}</span>{:else}Content{/if}</Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      {/snippet}
    </Popover.Root>
  {/if}
{/snippet}
{#snippet previewCardTriggers()}
  {#each Array.from({ length: triggerCount }, (_, index) => index + 1) as payload (payload)}
    {#if payload !== 1 || firstVisible}
      <PreviewCard.Trigger handle={previewCard} id={triggerCount === 1 ? singleId : `trigger-${payload}`} {payload} delay={0} href="#">Trigger {triggerCount === 1 ? '' : payload}</PreviewCard.Trigger>
    {/if}
  {/each}
{/snippet}
{#snippet previewCardRoot()}
  {#if mounted}
    <PreviewCard.Root handle={previewCard} {defaultOpen} {defaultTriggerId} {onOpenChange}>
      {#snippet children({ payload })}
        {#if location === 'inside'}{@render previewCardTriggers()}{/if}
        <span data-testid="payload">{payload ?? 'No payload'}</span>
        <PreviewCard.Portal>
          <PreviewCard.Positioner data-testid="positioner">
            <PreviewCard.Popup data-testid="content">{#if payloadContent}<span data-testid="content-payload">{payload}</span>{:else}Content{/if}</PreviewCard.Popup>
          </PreviewCard.Positioner>
        </PreviewCard.Portal>
      {/snippet}
    </PreviewCard.Root>
  {/if}
{/snippet}
{#snippet tooltipTriggers()}
  {#each Array.from({ length: triggerCount }, (_, index) => index + 1) as payload (payload)}
    {#if payload !== 1 || firstVisible}
      <Tooltip.Trigger handle={tooltip} id={triggerCount === 1 ? singleId : `trigger-${payload}`} {payload} delay={0}>Trigger {triggerCount === 1 ? '' : payload}</Tooltip.Trigger>
    {/if}
  {/each}
{/snippet}
{#snippet tooltipRoot()}
  {#if mounted}
    <Tooltip.Root handle={tooltip} {defaultOpen} {defaultTriggerId} {onOpenChange}>
      {#snippet children({ payload })}
        {#if location === 'inside'}{@render tooltipTriggers()}{/if}
        <span data-testid="payload">{payload ?? 'No payload'}</span>
        <Tooltip.Portal>
          <Tooltip.Positioner data-testid="positioner">
            <Tooltip.Popup data-testid="content">{#if payloadContent}<span data-testid="content-payload">{payload}</span>{:else}Content{/if}</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      {/snippet}
    </Tooltip.Root>
  {/if}
{/snippet}
{#if family === 'popover'}
  {#if location === 'before'}{@render popoverTriggers()}{/if}
  {@render popoverRoot()}
  {#if overlap}{@render popoverRoot()}{/if}
  {#if location === 'after'}{@render popoverTriggers()}{/if}
{:else if family === 'preview-card'}
  {#if location === 'before'}{@render previewCardTriggers()}{/if}
  {@render previewCardRoot()}
  {#if overlap}{@render previewCardRoot()}{/if}
  {#if location === 'after'}{@render previewCardTriggers()}{/if}
{:else if family === 'tooltip'}
  {#if location === 'before'}{@render tooltipTriggers()}{/if}
  {@render tooltipRoot()}
  {#if overlap}{@render tooltipRoot()}{/if}
  {#if location === 'after'}{@render tooltipTriggers()}{/if}
{/if}
