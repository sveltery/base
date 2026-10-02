<script lang="ts">
  // Input's uncredited describeConformance helper adaptations; MIT: parity/input/UPSTREAM_LICENSE.
  import { onMount } from 'svelte';
  import { Input, mergeProps } from '@sveltery/base';
  import type { InputState } from '@sveltery/base/input';
  let { scenario }: { scenario: string } = $props();
  let hydrated = $state(false); let ref = $state<HTMLElement | null>(); let renderRef = $state<HTMLElement | null>(); let disabled = $state(false);
  onMount(() => { hydrated = true; });
  const kind = $derived(scenario.replace('conformance-', ''));
  const customized = $derived(kind.startsWith('props-') && !['props-default', 'props-style'].includes(kind) || kind.startsWith('render-'));
  const wrapped = $derived(kind.startsWith('render-') && !kind.includes('class'));
  const classes = $derived(kind === 'class' ? 'test-class' : kind === 'render-class' ? 'component-classname' : kind === 'render-class-resolved' ? () => 'conditional-component-classname'
    : kind === 'render-class-object' ? { 'component-classname': true, 'object-class': true, 'excluded-class': false }
    : kind === 'render-class-array' ? ['component-classname', ['nested-class', { 'object-class': true, 'excluded-class': false }]]
    : kind === 'render-class-object-callback' ? (state: InputState) => ({ 'enabled-class': !state.disabled, 'disabled-class': state.disabled, 'object-class': true })
    : kind === 'render-class-array-callback' ? (state: InputState) => ['nested-class', ['object-class', state.disabled ? 'disabled-class' : 'enabled-class'], { 'excluded-class': false }]
    : undefined);
</script>
{#snippet replacement(props: Record<string | symbol, unknown>)}
  {#if wrapped}
    <div data-testid="base-ui-wrapper"><div {...props} data-testid="wrapped" data-test-value="source-value" bind:this={renderRef}></div></div>
  {:else}
    {const merged = $derived(mergeProps(props, { ...(kind.includes('class') ? { class: 'render-prop-classname' } : {}), ...(kind.includes('style') ? { style: 'color: green' } : {}) }))}
    <div {...merged} data-testid={kind.includes('class') ? 'test-component' : 'custom-root'} bind:this={renderRef}></div>
  {/if}
{/snippet}
<main data-hydrated={hydrated}>
  <Input bind:ref {disabled} render={customized ? replacement : undefined} class={classes} style={kind === 'props-style' ? 'color: green' : undefined}
    data-testid={kind === 'props-style' ? 'custom-root' : 'root'} lang={kind.startsWith('props-') ? 'fr' : undefined} data-foobar={kind.startsWith('props-') ? 'source-value' : undefined} />
  <output data-testid="refs">{JSON.stringify({ instanceofInput: hydrated && ref instanceof HTMLInputElement, present: !!ref, renderPresent: !!renderRef, tag: ref?.tagName, testid: ref?.getAttribute('data-testid'), renderTag: renderRef?.tagName, renderTestid: renderRef?.getAttribute('data-testid'), same: !!ref && ref === renderRef })}</output>
  {#if kind.includes('callback')}<button onclick={() => { disabled = !disabled; }}>Toggle disabled class</button>{/if}
</main>
