<script lang="ts">
  // Assertions derived from Base UI v1.8.0 (MIT); parity/collapsible/UPSTREAM_LICENSE.
  import { untrack, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import * as Collapsible from '../../../src/lib/collapsible/index.js';
  import type { CollapsiblePanelState, CollapsibleRootChangeEventDetails } from '../../../src/lib/collapsible/index.js';
  let { scenario = 'default' }: { scenario?: string } = $props();
  let ownerOpen = $state<boolean | undefined>(untrack(() => scenario.startsWith('controlled') || scenario === 'keep' ? false : undefined));
  let defaultOpen = $state(untrack(() => ['aria', 'manual-id', 'remount-id', 'cancel-close', 'late-panel', 'explicit-id'].includes(scenario)));
  let rootDisabled = $state(untrack(() => scenario.startsWith('disabled')));
  let triggerDisabled = $state<boolean | undefined>(untrack(() => scenario === 'disabled-override' ? false : undefined));
  let panelMounted = $state(true);
  let panelId = $state<string | undefined>(untrack(() => ['manual-id', 'explicit-id'].includes(scenario) ? 'custom-panel-id' : undefined));
  const events: { open: boolean; details: CollapsibleRootChangeEventDetails; before: string | null }[] = [];
  let callbackSwitched = $state(false);
  const callbackOwners: string[] = [];
  function oldChanged(open: boolean, details: CollapsibleRootChangeEventDetails) { callbackOwners.push('old'); changed(open, details); }
  function newChanged(open: boolean, details: CollapsibleRootChangeEventDetails) { callbackOwners.push('new'); changed(open, details); }
  const statuses: CollapsiblePanelState['transitionStatus'][] = [];
  function changed(open: boolean, details: CollapsibleRootChangeEventDetails) {
    if (scenario === 'cancel-open' || scenario === 'cancel-close' || (scenario === 'beforematch-cancel' && details.reason === 'none')) details.cancel();
    events.push({ open, details, before: document.getElementById('tested-trigger')!.getAttribute('aria-expanded') });
    if (scenario === 'controlled-accept' || scenario === 'keep') ownerOpen = open;
  }
  function record(state: CollapsiblePanelState) { statuses.push(state.transitionStatus); return ''; }
  export function snapshot() { return { events, statuses, callbackOwners }; }
  export function setPanelMounted(value: boolean) { panelMounted = value; }
  export function setPanelId(value: string | undefined) { panelId = value; }
  export function setOwnerOpen(value: boolean | undefined) { ownerOpen = value; }
  export function setDefaultOpen(value: boolean) { defaultOpen = value; }
  export function setDisabled(value: boolean, override: boolean | undefined = undefined) { rootDisabled = value; triggerDisabled = override; }
</script>
{#snippet latePanel(props: Record<string | symbol, unknown>, state: CollapsiblePanelState, children: Snippet | undefined)}
  {#if !state.open && state.transitionStatus === 'ending'}<div {...props as HTMLAttributes<HTMLDivElement>}>{@render children?.()}</div>{/if}
{/snippet}
<Collapsible.Root id="tested-root" open={ownerOpen} {defaultOpen} disabled={rootDisabled} onOpenChange={scenario === 'callback-snapshot' ? callbackSwitched ? newChanged : oldChanged : changed}
  class={state => state.open ? 'root-open' : 'root-closed'} style={state => `opacity:${state.open ? 1 : 0.5}`}>
  <Collapsible.Trigger id="tested-trigger" disabled={triggerDisabled} onclick={() => { if (scenario === 'callback-snapshot') callbackSwitched = true; if (scenario === 'controlled-consumer') ownerOpen = true; }}
    class={state => state.open ? 'trigger-open' : 'trigger-closed'} style={state => `opacity:${state.open ? 1 : 0.5}`}>Trigger</Collapsible.Trigger>
  {#if panelMounted}
    <Collapsible.Panel id={panelId} data-testid="panel" keepMounted={scenario === 'keep' || scenario === 'callbacks' || scenario === 'motion-layout' ? true : scenario === 'warning' ? false : undefined}
      hiddenUntilFound={scenario === 'warning' || scenario.startsWith('beforematch')} render={scenario === 'late-panel' ? latePanel : undefined}
      class={state => { record(state); return state.open ? 'panel-open' : 'panel-closed'; }} style={state => `opacity:${state.open ? 1 : 0.5}${scenario === 'motion-mock' || scenario === 'motion-layout' ? ';transition-duration:100ms;justify-content:center' : scenario.startsWith('beforematch') ? ';transition-duration:123ms' : ''}`}>This is panel content</Collapsible.Panel>
  {/if}
</Collapsible.Root>
