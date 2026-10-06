<script lang="ts">
  // Direct and supplemental paired fixtures. MIT: parity/accordion/UPSTREAM_LICENSE.
  import { onMount, untrack, flushSync, type Snippet } from 'svelte';
  import { Accordion, type AccordionItemState, type AccordionPanelState } from '@sveltery/base';
  import type { HTMLAttributes } from 'svelte/elements';
  import { accordionConfig, accordionCss } from './accordion-config.js';
  const { Root, Item, Header, Trigger, Panel } = Accordion;
  let { scenario = 'uncontrolled' }: { scenario?: string } = $props();
  const config = untrack(() => accordionConfig(scenario));
  let hydrated = $state(false),
    owner = $state<(number | string)[] | undefined>(
      untrack(() =>
        config.controlled ? (scenario === 'controlled-custom' ? ['one'] : []) : undefined,
      ),
    );
  let triggerId = $state<string | undefined>(
    untrack(() =>
      ['manual-trigger', 'trigger-remove'].includes(scenario) ? 'custom-trigger-id' : undefined,
    ),
  );
  let panelId = $state<string | undefined>(
    untrack(() => (scenario === 'manual-panel' ? 'custom-panel-id' : undefined)),
  );
  let triggerShown = $state(true),
    panelShown = $state(true),
    alternate = $state(false),
    reverse = $state(false),
    firstShown = $state(true);
  let calls = $state<Record<string, unknown>[]>([]),
    itemCalls = $state<Record<string, unknown>[]>([]),
    order = $state<string[]>([]);
  const states: AccordionItemState[] = [];
  const panelStatuses: string[] = [];
  type Details = { reason: string; event: Event; isCanceled: boolean; cancel(): void };
  function itemChanged(open: boolean, details: Details, index: number) {
    if (scenario === 'cancel-item' || scenario === 'cancel-item-controlled') details.cancel();
    order = [...order, 'item'];
    itemCalls = [
      ...itemCalls,
      {
        open,
        index,
        reason: details.reason,
        type: details.event.type,
        canceled: details.isCanceled,
      },
    ];
  }
  function changed(value: (number | string)[], details: Details) {
    if (scenario.startsWith('cancel-root') || scenario.startsWith('cancel-multiple'))
      details.cancel();
    order = [...order, 'root'];
    calls = [
      ...calls,
      {
        value,
        reason: details.reason,
        type: details.event.type,
        canceled: details.isCanceled,
        before: document.querySelector('[data-testid="trigger-1"]')?.getAttribute('aria-expanded'),
        defaultPrevented: details.event.defaultPrevented,
      },
    ];
    if (
      scenario === 'controlled-accept' ||
      (scenario === 'cancel-root-controlled' && !details.isCanceled)
    )
      owner = value;
  }
  function recordPanel(state: AccordionPanelState) {
    if (panelStatuses.at(-1) !== String(state.transitionStatus))
      panelStatuses.push(String(state.transitionStatus));
    return '';
  }
  function record(state: AccordionItemState) {
    states.push({ ...state });
    return `item-${state.index}`;
  }
  onMount(() => {
    hydrated = true;
    const browser = window as Window & {
      accordionStates?: AccordionItemState[];
      accordionPanelStatuses?: string[];
      accordionFlush?: (action: string) => void;
    };
    browser.accordionStates = states;
    browser.accordionPanelStatuses = panelStatuses;
    browser.accordionFlush = (action) =>
      flushSync(() => {
        document
          .querySelector(`[data-testid="${action === 'beforematch' ? 'panel' : 'trigger'}-1"]`)
          ?.dispatchEvent(
            action === 'beforematch'
              ? new Event('beforematch', { bubbles: true })
              : new MouseEvent('click', { bubbles: true }),
          );
      });
    return () => {
      delete browser.accordionStates;
      delete browser.accordionPanelStatuses;
      delete browser.accordionFlush;
    };
  });
</script>

<!-- eslint-disable svelte/no-at-html-tags -- Fixed authored fixture CSS contains no external input. -->
<svelte:head>{@html `<style>${accordionCss}</style>`}</svelte:head>
{#snippet triggerHost(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children: Snippet | undefined,
)}<span {...props as HTMLAttributes<HTMLSpanElement>}>{@render children?.()}</span>{/snippet}
{#snippet panelHost(
  props: Record<string | symbol, unknown>,
  state: AccordionPanelState,
  children: Snippet | undefined,
)}
  {recordPanel(state)}
  {#if scenario === 'remove-close' && !state.open}<!-- The authored render removes the host while closing. -->
  {:else if alternate}<section
      {...props as HTMLAttributes<HTMLElement>}
      {...scenario === 'replaced-hidden-override' ? { hidden: false } : {}}
      >{@render children?.()}</section
    >{:else}<div
      {...props as HTMLAttributes<HTMLDivElement>}
      {...scenario === 'replaced-hidden-override' ? { hidden: false } : {}}
      data-status={state.transitionStatus}>{@render children?.()}</div
    >{/if}
{/snippet}
{#snippet item(index: number)}
  <Item
    value={config.implicit ? undefined : config.values[index]}
    disabled={config.itemDisabled && index === 0}
    data-testid={`item-${index + 1}`}
    class={record}
    onOpenChange={(open, details) => itemChanged(open, details, index)}
  >
    <Header data-testid={`header-${index + 1}`}>
      {#if index !== 0 || triggerShown}<Trigger
          data-testid={`trigger-${index + 1}`}
          id={index === 0 ? triggerId : undefined}
          nativeButton={!config.custom}
          render={config.custom ? triggerHost : undefined}
          disabled={scenario === 'disabled-root' || scenario === 'disabled-item'
            ? false
            : undefined}
          onmouseup={scenario === 'mouseup' ? (event) => event.preventBaseUIHandler() : undefined}
          >Trigger {index + 1}</Trigger
        >{/if}
    </Header>
    {#if index !== 0 || panelShown}<Panel
        data-testid={`panel-${index + 1}`}
        id={index === 0 ? panelId : undefined}
        class={scenario === 'switch' || scenario === 'remove-close'
          ? 'accordion-motion'
          : scenario === 'important'
            ? 'accordion-mixed'
            : ''}
        style={scenario === 'ssr-inline'
          ? 'animation-duration:100ms;animation-name:accordion-down;animation-timing-function:linear'
          : scenario === 'important'
            ? 'justify-content:center!important'
            : undefined}
        keepMounted={scenario === 'panel-warning' || (scenario === 'root-hidden' && index === 1)
          ? false
          : config.keep
            ? true
            : undefined}
        hiddenUntilFound={scenario === 'root-hidden' && index === 1
          ? false
          : config.hidden
            ? true
            : undefined}
        render={panelHost}>Panel contents {index + 1}</Panel
      >{/if}
  </Item>
{/snippet}
<main data-hydrated={hydrated}>
  <Root
    data-testid="root"
    value={owner}
    defaultValue={config.initial ? [config.values[0]] : []}
    multiple={config.multiple}
    disabled={config.rootDisabled}
    keepMounted={scenario === 'root-warning' ? false : config.rootKeep ? true : undefined}
    hiddenUntilFound={config.rootHidden}
    orientation={scenario === 'no-roving' ? 'horizontal' : undefined}
    loopFocus={scenario === 'no-roving' ? true : undefined}
    onValueChange={changed}
  >
    {#each reverse ? [1, 0] : [0, 1] as index (index)}{#if index !== 0 || firstShown}{@render item(
          index,
        )}{/if}{/each}
  </Root>
  <button onclick={() => (owner = owner?.length ? [] : [config.values[0]])}
    >toggle externally</button
  >
  <button onclick={() => (triggerId = 'custom-trigger-id-1')}>Set id 1</button><button
    onclick={() => (triggerId = 'custom-trigger-id-2')}>Set id 2</button
  ><button onclick={() => (triggerId = undefined)}>Remove id</button>
  <button onclick={() => (triggerShown = !triggerShown)}>Toggle trigger</button><button
    onclick={() => (panelShown = !panelShown)}>Toggle panel</button
  ><button onclick={() => (panelId = panelId ? undefined : 'manual-panel')}>Change panel ID</button>
  <button onclick={() => (alternate = !alternate)}>Replace host</button><button
    onclick={() => (reverse = !reverse)}>Reverse items</button
  ><button onclick={() => (firstShown = !firstShown)}>Toggle first item</button>
  <output data-testid="calls">{JSON.stringify(calls)}</output><output data-testid="item-calls"
    >{JSON.stringify(itemCalls)}</output
  ><output data-testid="order">{JSON.stringify(order)}</output>
</main>
