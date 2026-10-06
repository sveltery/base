<script lang="ts">
  // Pinned complete Popover leaf-test setup represented with native snippets/runes.
  // MIT: parity/popup-family/UPSTREAM_LICENSE; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  import * as Popover from '../../src/lib/popover/index.js';
  import * as Tooltip from '../../src/lib/tooltip/index.js';
  import type { PopoverRootChangeEventDetails } from '../../src/lib/popover/types.js';
  let {
    kind = 'close',
    delay,
    modal = false,
    onOpenChange = () => {},
  }: {
    kind?: string;
    delay?: number | undefined;
    modal?: boolean | 'trap-focus';
    onOpenChange?: (open: boolean, details: PopoverRootChangeEventDetails) => void;
  } = $props();
  let triggerId = $state<string | null>('trigger-1');
  export function repoint() {
    triggerId = 'unregistered';
  }
</script>

{#if kind === 'closed-close'}
  <Popover.Root><Popover.Close aria-label="Close popover" /></Popover.Root>
{:else}
  {#if kind === 'modal-close'}<button data-testid="outside">Outside</button>{/if}
  <Popover.Root
    defaultOpen={kind !== 'backdrop'}
    open={kind === 'unregistered' ? true : undefined}
    triggerId={kind === 'unregistered' ? triggerId : undefined}
    defaultTriggerId={kind === 'no-trigger' ? 'never-mounted' : undefined}
    {modal}
    {onOpenChange}
  >
    {#if kind !== 'no-trigger'}<Popover.Trigger
        id="trigger-1"
        {delay}
        openOnHover={kind === 'backdrop'}
        >{kind === 'backdrop' ? 'Open' : 'Trigger'}</Popover.Trigger
      >{/if}
    <Popover.Portal>
      {#if kind === 'backdrop'}<Popover.Backdrop data-testid="backdrop" />{/if}
      <Popover.Positioner>
        <Popover.Popup>
          {#if kind === 'title'}<Popover.Title>Title</Popover.Title>
          {:else if kind === 'description'}<Popover.Description>Title</Popover.Description>
          {:else if kind !== 'backdrop'}
            Content
            {#if kind === 'tooltip-close'}
              <Popover.Close data-testid="close">
                {#snippet render(popoverCloseProps)}
                  <Tooltip.Root>
                    <Tooltip.Trigger {...popoverCloseProps}>Close</Tooltip.Trigger>
                    <Tooltip.Portal
                      ><Tooltip.Positioner
                        ><Tooltip.Popup>Tooltip</Tooltip.Popup></Tooltip.Positioner
                      ></Tooltip.Portal
                    >
                  </Tooltip.Root>
                {/snippet}
              </Popover.Close>
            {:else}<Popover.Close
                data-testid="close"
                aria-label={kind === 'modal-close' ? 'Close popover' : undefined}
              />{/if}
          {/if}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  </Popover.Root>
{/if}
