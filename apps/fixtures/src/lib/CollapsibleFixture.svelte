<script lang="ts">
  // Direct and supplemental paired fixtures. MIT: parity/collapsible/UPSTREAM_LICENSE.
  import { onMount, untrack, flushSync, type Snippet } from 'svelte';
  import { Collapsible, mergeProps, type CollapsiblePanelState } from '@sveltery/base';
  import CollapsibleRaceClose from './CollapsibleRaceClose.svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { collapsibleConfig, collapsibleCss } from './collapsible-config.js';
  const { Root, Trigger, Panel } = Collapsible;
  let { scenario = 'uncontrolled' }: { scenario?: string } = $props();
  const config = untrack(() => collapsibleConfig(scenario));
  let hydrated = $state(false), ownerOpen = $state<boolean | undefined>(config.controlled ? false : undefined);
  let defaultOpen = $state(config.initialOpen), disabled = $state(config.disabled), shown = $state(true), panelShown = $state(true), alternate = $state(false), explicitId = $state<string | undefined>(untrack(() => scenario === 'manual-id' ? 'custom-panel-id' : undefined));
  let motionEnabled = $state(untrack(() => scenario !== 'beforematch-no-motion'));
  let calls = $state<Record<string, unknown>[]>([]), order = $state<string[]>([]), callbackOwners = $state<string[]>([]), switched = $state(false), statuses = $state<string[]>([]);
  let submitted = $state(0), reset = $state(0), externalSubmitted = $state(0);
  let panelRef = $state<HTMLElement | null | undefined>();
  const style = $derived(motionEnabled ? config.panelStyle : '');
  const motion = $derived(motionEnabled ? config.motionClass : '');
  function changed(next: boolean, details: { reason: string; event: Event; isCanceled: boolean; cancel(): void }) {
    if (scenario === 'beforematch-cancel' && details.reason === 'none' || ['cancel', 'cancel-close'].includes(scenario)) details.cancel();
    order = [...order, 'change'];
    calls = [...calls, { open: next, reason: details.reason, type: details.event.type, before: document.getElementById('tested-trigger')?.getAttribute('aria-expanded'), canceled: details.isCanceled, defaultPrevented: details.event.defaultPrevented, mouse: details.event instanceof MouseEvent, cancelType: typeof details.cancel, allowType: typeof (details as { allowPropagation?: unknown }).allowPropagation }];
    if (scenario === 'controlled-accept' || scenario === 'controlled-consumer' || scenario === 'controlled-render' || scenario === 'controlled-keep') ownerOpen = next;
  }
  function oldChanged(next: boolean, details: Parameters<typeof changed>[1]) { callbackOwners = [...callbackOwners, 'old']; changed(next, details); }
  function newChanged(next: boolean, details: Parameters<typeof changed>[1]) { callbackOwners = [...callbackOwners, 'new']; changed(next, details); }
  function recordPanel(state: CollapsiblePanelState) { untrack(() => { if (statuses.at(-1) !== String(state.transitionStatus)) statuses = [...statuses, String(state.transitionStatus)]; }); return ''; }
  onMount(() => {
    hydrated = true;
    const browser = window as Window & { collapsibleFlush?: (action: string) => void };
    browser.collapsibleFlush = action => flushSync(() => { if (action === 'beforematch') panelRef?.dispatchEvent(new Event('beforematch', { bubbles: true })); else document.getElementById('tested-trigger')?.click(); });
    return () => { delete browser.collapsibleFlush; };
  });
</script>
<!-- eslint-disable svelte/no-at-html-tags -- Fixed authored fixture CSS contains no external input. -->
<svelte:head>{@html `<style>${collapsibleCss}</style>`}</svelte:head>
{#snippet triggerHost(props: Record<string | symbol, unknown>, _state: { open: boolean }, children: Snippet | undefined)}
  {#if scenario === 'link'}<a {...props} href="#target">{@render children?.()}</a>
  {:else}<span {...mergeProps(props, { onclick: (event: MouseEvent & { preventBaseUIHandler(): void }) => { order = [...order, 'render']; if (scenario === 'controlled-render') ownerOpen = true; if (scenario === 'callback-render') switched = true; if (scenario === 'render-cancel') event.preventBaseUIHandler(); } })}>{@render children?.()}</span>{/if}
{/snippet}
{#snippet panelHost(props: Record<string | symbol, unknown>, state: CollapsiblePanelState, children: Snippet | undefined)}
  {recordPanel(state)}
  {#if scenario === 'remove-close' && !state.open || scenario === 'ending-host' && !state.open && state.transitionStatus !== 'ending'}<!-- Render intentionally removes the host. -->
  {:else if alternate}<section {...props as HTMLAttributes<HTMLElement>}>{@render children?.()}</section>
  {:else}<div {...props as HTMLAttributes<HTMLDivElement>} data-status={state.transitionStatus}>{#if scenario === 'race-open'}<CollapsibleRaceClose open={state.open} />{/if}{@render children?.()}</div>{/if}
{/snippet}
<main data-hydrated={hydrated}>
  {#if scenario === 'outside-trigger'}{#if hydrated}<Trigger />{/if}
  {:else if shown}
    <Root data-testid="root" class={state => scenario === 'state-callbacks' ? state.open ? 'root-open' : 'root-closed' : ''} style={state => scenario === 'state-callbacks' ? `opacity:${state.open ? 1 : 0.5}` : ''} open={ownerOpen} {defaultOpen} {disabled} onOpenChange={scenario.startsWith('callback-') ? switched ? newChanged : oldChanged : changed}>
      <form id="collapsible-form" onsubmit={event => { event.preventDefault(); submitted++; }} onreset={() => reset++}>
        <input aria-label="Reset field" value="initial" />
        <Trigger class={state => scenario === 'state-callbacks' ? state.open ? 'trigger-open' : 'trigger-closed' : ''} style={state => scenario === 'state-callbacks' ? `opacity:${state.open ? 1 : 0.5}` : ''} id={scenario === 'trigger-id' ? 'custom-trigger-id' : 'tested-trigger'} nativeButton={!config.custom} render={config.custom ? triggerHost : undefined}
          disabled={scenario === 'disabled-override' ? false : undefined}
          {...scenario === 'submit' ? { type: 'submit', name: 'collapsible', value: 'sent' } : scenario === 'reset' ? { type: 'reset' } : scenario === 'external-form' ? { type: 'submit', form: 'external-form', name: 'collapsible', value: 'sent' } : {}}
          onclick={() => { order = [...order, 'consumer']; if (scenario === 'controlled-consumer') ownerOpen = true; if (scenario === 'callback-consumer') switched = true; }}>Trigger</Trigger>
        {#if panelShown}<Panel id={explicitId} data-testid="panel" class={state => scenario === 'state-callbacks' ? state.open ? 'panel-open' : 'panel-closed' : motion} style={state => scenario === 'state-callbacks' ? `opacity:${state.open ? 1 : 0.5}` : style} bind:ref={panelRef} keepMounted={scenario === 'hidden-warning' ? false : config.keep} hiddenUntilFound={config.hidden} render={panelHost}>{#if scenario !== 'zero'}This is panel content{/if}</Panel>{/if}
      </form>
    </Root>
  {/if}
  <form id="external-form" onsubmit={event => { event.preventDefault(); externalSubmitted++; }}></form>
  <button onclick={() => ownerOpen = !ownerOpen}>toggle externally</button>
  <button onclick={() => ownerOpen = undefined}>Release controlled value</button>
  <button onclick={() => defaultOpen = !defaultOpen}>Change default</button>
  <button onclick={() => disabled = !disabled}>Change disabled</button>
  <button onclick={() => shown = !shown}>Toggle mounting</button>
  <button onclick={() => panelShown = !panelShown}>Toggle panel</button>
  <button onclick={() => alternate = !alternate}>Replace host</button>
  <button onclick={() => explicitId = explicitId ? undefined : 'manual-panel'}>Change ID</button>
  <button onclick={() => motionEnabled = true}>enable motion</button>
  <output data-testid="calls">{JSON.stringify(calls)}</output><output data-testid="order">{JSON.stringify(order)}</output>
  <output data-testid="callback-owners">{JSON.stringify(callbackOwners)}</output><output data-testid="statuses">{JSON.stringify(statuses)}</output>
  <output data-testid="forms">{JSON.stringify({ submitted, reset, externalSubmitted })}</output>
  <div id="target">Link target</div>
</main>
