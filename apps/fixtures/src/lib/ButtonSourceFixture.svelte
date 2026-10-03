<script lang="ts">
  // Public Button/source composition witnesses; Base UI pin provenance: parity/button/source-correspondence.md, MIT.
  import { onMount, untrack, type Snippet } from 'svelte';
  import { Button, type HTMLProps } from '@sveltery/base';
  import { Button as InnerButton } from '@sveltery/base/button';
  import CompositeRoot from '../../../../packages/base/dist/internals/composite/root/CompositeRoot.svelte';
  import { mergeProps } from '@sveltery/base/merge-props';
  let { scenario = 'composite-custom' }: { scenario?: string } = $props();
  let hydrated = $state(false);
  let visible = $state(true);
  let disabled = $state(untrack(() => scenario === 'nested-disabled' || scenario === 'override-disabled'));
  let ref = $state<HTMLElement | null>();
  let innerRef = $state<HTMLElement | null>();
  let calls = $state<string[]>([]);
  const native = $derived(['composite-native', 'composite-submit', 'composite-reset', 'override-disabled', 'nested-disabled', 'native-mismatch'].includes(scenario));
  const composite = $derived(scenario !== 'shadow' && scenario !== 'props');
  const textNavigation = $derived(scenario === 'composite-menuitem' || scenario === 'composite-option' || scenario === 'composite-gridcell');
  const role = $derived(textNavigation ? scenario.replace('composite-', '') : scenario === 'composite-switch' ? 'switch' : undefined);
  function record(value: string) { calls = [...calls, value]; }
  function keydown(event: KeyboardEvent & { preventBaseUIHandler(): void }) {
    record('keydown');
    if (textNavigation || scenario === 'composite-switch') event.preventDefault();
    if (scenario === 'composite-cancel') event.preventBaseUIHandler();
  }
  function attached(host: HTMLElement) {
    if (scenario === 'shadow' && !host.shadowRoot) {
      const shadow = host.attachShadow({ mode: 'open' });
      const inner = document.createElement('span'); inner.tabIndex = 0; shadow.append(inner);
    }
    untrack(() => record('attach'));
    return () => untrack(() => record('detach'));
  }
  export function snapshot() { return { calls: [...calls], ref, innerRef }; }
  onMount(() => { hydrated = true; });
</script>
{#snippet replacement(props: HTMLProps, state: { disabled: boolean }, children: Snippet | undefined)}
  {#if scenario.startsWith('nested-')}
    <InnerButton {...props} id="source-button" nativeButton={native} focusableWhenDisabled {disabled} bind:ref={innerRef} render={native ? undefined : nestedHost}>{@render children?.()}</InnerButton>
  {:else if scenario === 'composite-link' || scenario === 'composite-menuitem'}
    <a {...props} href="#source-target">{@render children?.()}</a>
  {:else if scenario === 'override-disabled'}
    <button {...props} disabled>{@render children?.()}</button>
  {:else}
    <span {...mergeProps(props, { onclick: () => record('render-click') })} data-render-disabled={state.disabled}>{@render children?.()}</span>
  {/if}
{/snippet}
{#snippet nestedHost(props: HTMLProps, _state: { disabled: boolean }, children: Snippet | undefined)}
  <span {...props}>{@render children?.()}</span>
{/snippet}
{#snippet tested()}
  {#if visible}
    <Button id="source-button" {disabled} nativeButton={native} focusableWhenDisabled={disabled} tabindex={0} {role}
      type={scenario === 'composite-submit' ? 'submit' : scenario === 'composite-reset' ? 'reset' : 'button'}
      render={native && !['nested-disabled', 'override-disabled', 'native-mismatch'].includes(scenario) ? undefined : replacement}
      bind:ref {@attach attached} class={state => ['source-class', { disabled: state.disabled }]} style={state => ({ opacity: state.disabled ? 0.5 : 1 })}
      onclick={() => record('click')} onkeydown={keydown} onkeyup={() => record('keyup')}>Source action</Button>
  {/if}
{/snippet}
<main data-hydrated={hydrated} data-framework="svelte">
  <form onsubmit={event => { event.preventDefault(); record('submit'); }} onreset={event => { event.preventDefault(); record('reset'); }}>
    {#if composite}<CompositeRoot>{@render tested()}</CompositeRoot>{:else}{@render tested()}{/if}
  </form>
  <button id="remove-button" onclick={() => { visible = !visible; }}>Toggle host</button>
  <button id="enable-button" onclick={() => { disabled = !disabled; }}>Toggle disabled</button>
  <output data-testid="source-calls">{JSON.stringify(calls)}</output>
  <output data-testid="source-ref">{ref?.id ?? 'null'}</output>
  <output data-testid="source-inner-ref">{innerRef?.id ?? 'null'}</output>
  <div id="source-target">Target</div>
</main>
