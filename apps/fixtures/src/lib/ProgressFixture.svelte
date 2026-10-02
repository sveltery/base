<script lang="ts">
  import { onMount, untrack, type Snippet } from 'svelte';
  import { Progress, type ProgressRootState } from '../../../../packages/base/src/lib/progress/index.js';
  import { mergeProps } from '../../../../packages/base/src/lib/merge-props/index.js';
  import { progressConfig, rawValue, type ProgressConfig } from './progress-config.js';
  let { ariaSpy, valueSpy, scenario = 'default' }: { scenario?: string; ariaSpy?: (formatted: string, raw: number | null) => void; valueSpy?: (formatted: string | null, raw: number | null) => void } = $props();
  let config = $state<ProgressConfig>(untrack(() => progressConfig(scenario)));
  let hydrated = $state(false), shown = $state(true), showLabel = $state(true), labelId = $state<string | undefined>(untrack(() => scenario === 'labels' ? 'label-a' : undefined));
  let tag = $state('section');
  let rootRef = $state<HTMLElement | null>(), labelRef = $state<HTMLElement | null>(), trackRef = $state<HTMLElement | null>(), indicatorRef = $state<HTMLElement | null>(), valueRef = $state<HTMLElement | null>();
  const replacement = $derived(scenario === 'replacement' || scenario === 'replacement-callback');
  const callback = $derived(scenario === 'callback' || scenario.startsWith('formatted-'));
  const valueCallback = $derived(scenario.startsWith('value-') || scenario === 'replacement-callback');
  onMount(() => { hydrated = true; });
  export function update(patch: Partial<ProgressConfig>) { config = { ...config, ...patch }; }
  export function changeLabel(id: string | undefined) { labelId = id; }
  export function removeLabel() { showLabel = false; }
  export function replaceHost() { tag = 'article'; }
  export function remove() { shown = false; }
  export function refs() { return [rootRef, labelRef, trackRef, indicatorRef, valueRef]; }
  function aria(formatted: string, raw: number | null) { ariaSpy?.(formatted, raw); return raw == null ? 'Waiting to start' : scenario.startsWith('formatted-') ? `${formatted} (raw: ${raw})` : `${formatted} uploaded`; }
</script>
{#snippet host(props: Record<string | symbol, unknown>, state: ProgressRootState, children: Snippet | undefined)}
  <svelte:element this={tag} {...mergeProps(props, { class: 'replacement' })} data-render-state={state.status}>{@render children?.()}</svelte:element>
{/snippet}
{#snippet indicatorHost(props: Record<string | symbol, unknown>, _state: ProgressRootState, children: Snippet | undefined)}<span {...props as import('svelte/elements').HTMLAttributes<HTMLSpanElement>}>{@render children?.()}</span>{/snippet}
{#snippet display(formatted: string | null, raw: number | null)}{valueSpy?.(formatted, raw) ?? ''}{formatted}|{rawValue(raw)}{/snippet}
<main data-hydrated={hydrated}>
  <button onclick={() => update({ value: 77 })}>Set 77</button>
  <button onclick={() => update({ value: 50 })}>Set 50</button>
  <button onclick={() => update({ value: 100 })}>Set 100</button>
  <button onclick={() => update({ value: null })}>Set null</button>
  <button onclick={() => update({ value: NaN })}>Set NaN</button>
  <button onclick={() => update({ format: { style: 'currency', currency: 'EUR' } })}>Set EUR</button>
  <button onclick={() => update({ locale: 'de-DE' })}>Set German</button>
  <button onclick={() => changeLabel('label-b')}>Change id</button>
  <button onclick={removeLabel}>Remove label</button>
  <button onclick={replaceHost}>Replace host</button>
  <button onclick={remove}>Remove root</button>
  {#if shown}
    <Progress.Root {...config} id="tested-progress" bind:ref={rootRef} render={replacement ? host : undefined} getAriaValueText={callback ? aria : undefined}
      {...(scenario === 'override' ? { role: 'meter' as const, 'aria-valuenow': 123, 'aria-valuetext': 'consumer', 'aria-labelledby': 'external', 'data-complete': 'consumer' } : {})}
      class={state => `root-${state.status}`} style={state => `opacity:${state.status === 'complete' ? 1 : 0.5}`}>
      {#if showLabel}<Progress.Label id={labelId} data-testid="label" bind:ref={labelRef} render={replacement ? host : undefined}>Downloading</Progress.Label>{/if}
      <Progress.Value data-testid="value" bind:ref={valueRef} render={replacement ? host : undefined} children={valueCallback ? display : undefined}/>
      <Progress.Track data-testid="track" bind:ref={trackRef} style="width:300px;height:12px" render={replacement ? host : undefined}>
        <Progress.Indicator data-testid="indicator" bind:ref={indicatorRef} render={scenario === 'determinate' ? indicatorHost : replacement ? host : undefined}
          style={scenario === 'style-override' ? 'width:7px;height:9px;inset-inline-start:2px' : undefined} />
      </Progress.Track>
    </Progress.Root>
  {/if}
  <output data-testid="refs">{[rootRef, labelRef, trackRef, indicatorRef, valueRef].map(node => node === undefined ? 'undefined' : node === null ? 'null' : node.tagName).join(',')}</output>
</main>
