<script lang="ts">
  import { First, Second, type CollapsibleTriggerProps, type CollapsiblePanelProps, type CollapsibleTriggerState, type CollapsiblePanelState } from './imports.js';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  type TriggerRenderProps = Parameters<NonNullable<CollapsibleTriggerProps['render']>>[0];
  type PanelRenderProps = Parameters<NonNullable<CollapsiblePanelProps['render']>>[0];
  let root = $state<HTMLElement | null>(), trigger = $state<HTMLElement | null>(), panel = $state<HTMLElement | null>();
  let present = $state(true), replaced = $state(false), cancel = $state(true);
  const calls: string[] = [];
  const attachments: { host: HTMLElement; attached: boolean }[] = [];
  function attachHost(host: HTMLElement) { attachments.push({ host, attached: true }); return () => attachments.push({ host, attached: false }); }
  export function replace() { replaced = true; }
  export function remove() { present = false; }
  export function snapshot() { return { root, trigger, panel, calls, attachments }; }
</script>
{#snippet triggerHost(props: TriggerRenderProps, _state: CollapsibleTriggerState, children: Snippet | undefined)}<span {...props as HTMLAttributes<HTMLSpanElement>}>{@render children?.()}</span>{/snippet}
{#snippet panelHost(props: PanelRenderProps, _state: CollapsiblePanelState, children: Snippet | undefined)}
  {#if replaced}<section {...props as HTMLAttributes<HTMLElement>}>{@render children?.()}</section>
  {:else}<div {...props as HTMLAttributes<HTMLDivElement>}>{@render children?.()}</div>{/if}
{/snippet}
{#if present}
  <First.Root id="packed-root" bind:ref={root} style="opacity:1" onOpenChange={(open, details) => { calls.push(`change:${open}:${trigger?.getAttribute('aria-expanded')}`); if (cancel) { details.cancel(); cancel = false; } }}>
    <Second.Trigger id="packed-trigger" render={triggerHost} nativeButton={false} bind:ref={trigger} {@attach attachHost}
      onclick={() => calls.push('consumer')} class={state => ['trigger', { open: state.open }]} style={state => `opacity:${state.open ? 1 : 0.5}`}>Open</Second.Trigger>
    <First.Panel hiddenUntilFound render={panelHost} bind:ref={panel} {@attach attachHost} style="color:red">Packed panel content</First.Panel>
  </First.Root>
{/if}
