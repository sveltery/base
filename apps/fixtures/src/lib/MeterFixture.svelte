<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import { Meter, type MeterRootState } from '../../../../packages/base/src/lib/meter/index.js';
  import { mergeProps } from '../../../../packages/base/src/lib/merge-props/index.js';
  import { meterConfig, rawValue, type MeterConfig } from './meter-config.js';
  let { ariaSpy, valueSpy, scenario = 'default' }: { scenario?: string; ariaSpy?: (formatted: string, raw: number) => void; valueSpy?: (formatted: string, raw: number) => void } = $props();
  let config = $state<MeterConfig>(untrack(() => meterConfig(scenario)));
  let mainRef = $state<HTMLElement>();
  const ariaCalls: [string, number][] = [], valueCalls: [string, number][] = [];
  let hydrated = $state(false), shown = $state(true), showLabel = $state(true), labelId = $state<string | undefined>(untrack(() => scenario === 'labels' ? 'label-a' : undefined));
  let tag = $state('section'), firstLabel = $state(true), secondaryId = $state<string | undefined>('second');
  let rootRef = $state<HTMLElement | null>(), labelRef = $state<HTMLElement | null>(), trackRef = $state<HTMLElement | null>(), indicatorRef = $state<HTMLElement | null>(), valueRef = $state<HTMLElement | null>();
  const replacement = $derived(scenario === 'replacement' || scenario === 'replacement-callback');
  const callback = $derived(scenario === 'callback' || scenario === 'raw-callback' || scenario.startsWith('formatted-'));
  const valueCallback = $derived(scenario.startsWith('value-') || scenario === 'raw-callback' || scenario === 'replacement-callback');
  onMount(() => {
    if (mainRef) Object.assign(mainRef, { meterAriaCalls: () => ariaCalls, meterValueCalls: () => valueCalls, meterRefs: () => refs() });
    hydrated = true;
  });
  export function update(patch: Partial<MeterConfig>) { config = { ...config, ...patch }; }
  export function changeLabel(id: string | undefined) { labelId = id; }
  export function removeLabel() { showLabel = false; }
  export function replaceHost() { tag = 'article'; }
  export function remove() { shown = false; }
  export function refs() { return [rootRef, labelRef, trackRef, indicatorRef, valueRef]; }
  function observeValue(formatted: string, raw: number) { valueCalls.push([formatted, raw]); valueSpy?.(formatted, raw); return ''; }
  function aria(formatted: string, raw: number) {
    ariaCalls.push([formatted, raw]); ariaSpy?.(formatted, raw);
    return scenario === 'callback' ? `${raw} of 100 (${formatted})` : `${formatted} (raw: ${raw})`;
  }
</script>
{#snippet host(props: Record<string | symbol, unknown>, state: MeterRootState, children: Snippet | undefined)}
  <svelte:element this={tag} {...mergeProps(props, { class: 'replacement' })} data-render-state={JSON.stringify(state)}>{@render children?.()}</svelte:element>
{/snippet}
{#snippet indicatorHost(props: Record<string | symbol, unknown>, _state: MeterRootState, children: Snippet | undefined)}<span {...props as import('svelte/elements').HTMLAttributes<HTMLSpanElement>}>{@render children?.()}</span>{/snippet}
{#snippet display(formatted: string, raw: number)}{observeValue(formatted, raw)}{formatted}|{rawValue(raw)}{/snippet}
<main bind:this={mainRef} data-hydrated={hydrated}>
  <button onclick={() => update({ value: 77 })}>Set 77</button>
  <button onclick={() => update({ min: 40, max: 20 })}>Reverse bounds</button>
  <button onclick={() => update({ min: NaN, max: 100 })}>NaN min</button>
  <button onclick={() => update({ min: 0, max: Infinity })}>Infinite max</button>
  <button onclick={() => update({ min: 20, max: 40, value: NaN })}>NaN custom range</button>
  <button onclick={() => { firstLabel = false; }}>Remove first</button>
  <button onclick={() => { secondaryId = undefined; }}>Generate second id</button>
  <button onclick={() => update({ value: 60 })}>Set 60</button>
  <button onclick={() => update({ min: 20, max: 60, value: 50 })}>Update range</button>
  <button onclick={() => update({ value: NaN })}>Set NaN</button>
  <button onclick={() => update({ value: Infinity })}>Set Infinity</button>
  <button onclick={() => update({ value: -Infinity })}>Set -Infinity</button>
  <button onclick={() => update({ format: { style: 'currency', currency: 'EUR' } })}>Set EUR</button>
  <button onclick={() => update({ format: undefined })}>Clear format</button>
  <button onclick={() => update({ locale: 'de-DE' })}>Set German</button>
  <button onclick={() => changeLabel('label-b')}>Change id</button>
  <button onclick={() => changeLabel(undefined)}>Generate id</button>
  <button onclick={removeLabel}>Remove label</button>
  <button onclick={() => { showLabel = true; }}>Remount label</button>
  <button onclick={replaceHost}>Replace host</button>
  <button onclick={remove}>Remove root</button>
  {#if scenario === 'nested'}
    <Meter.Root value={config.value} id="outer">
      {#if firstLabel}<Meter.Label id="first">First</Meter.Label>{/if}
      <Meter.Label id={secondaryId} data-testid="second-label">Second</Meter.Label><Meter.Value id="outer-value"/>
      <Meter.Root value={100} id="inner"><Meter.Label id="inner-label">Inner</Meter.Label><Meter.Value id="inner-value"/></Meter.Root>
    </Meter.Root>
  {:else if shown}
    <Meter.Root {...config} id="tested-meter" bind:ref={rootRef} render={replacement ? host : undefined} getAriaValueText={callback ? aria : undefined}
      {...(scenario === 'override' ? { role: 'progressbar' as const, 'aria-valuenow': 123, 'aria-valuetext': 'consumer', 'aria-labelledby': 'external' } : {})}
      class={state => `root-state-${Object.keys(state).length}`} style={state => `opacity:${Object.keys(state).length === 0 ? 0.5 : 1}${scenario === 'determinate' || scenario === 'zero' ? ';width:100px' : ''}`}>
      {#if showLabel}<Meter.Label id={labelId} data-testid="label" bind:ref={labelRef} render={replacement ? host : undefined}>Battery Level</Meter.Label>{/if}
      <Meter.Value data-testid="value" bind:ref={valueRef} render={replacement ? host : undefined} children={valueCallback ? display : undefined}/>
      <Meter.Track data-testid="track" bind:ref={trackRef} style={scenario === 'determinate' || scenario === 'zero' ? undefined : 'width:300px;height:12px'} render={replacement ? host : undefined}>
        <Meter.Indicator data-testid="indicator" bind:ref={indicatorRef} render={scenario === 'replacement-indicator' ? indicatorHost : replacement ? host : undefined}
          style={scenario === 'replacement-indicator' ? 'display:block' : scenario === 'style-override' ? 'width:7px;height:9px;inset-inline-start:2px' : undefined} />
      </Meter.Track>
    </Meter.Root>
  {/if}
  <output data-testid="refs">{[rootRef, labelRef, trackRef, indicatorRef, valueRef].map(node => node === undefined ? 'undefined' : node === null ? 'null' : node.tagName).join(',')}</output>
</main>
