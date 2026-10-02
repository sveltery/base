<script lang="ts">
  // Base UI 1.8.0 ordinary/conformance adapters; MIT: parity/separator/UPSTREAM_LICENSE.
  import { onMount, untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { Separator, mergeProps, type SeparatorState } from '@sveltery/base';
  let { scenario = 'default' }: { scenario?: string } = $props();
  let hydrated = $state(false);
  let mounted = $state(true);
  let mode = $state('initial');
  let orientation = $state<SeparatorState['orientation'] | undefined>(untrack(() => scenario === 'vertical' ? 'vertical' : scenario === 'horizontal' ? 'horizontal' : undefined));
  let ref = $state<HTMLElement | null>();
  let renderRef = $state<HTMLElement | null>(null);
  let attachmentNode = $state<HTMLElement | null>(null);
  let cleanups = $state(0);
  let calls = $state<string[]>([]);
  let tag = $state('section');
  const key = createAttachmentKey();
  const attachments = { [key]: (node: HTMLElement) => { attachmentNode = node; return () => { attachmentNode = null; cleanups += 1; }; } };
  const customized = $derived(scenario.startsWith('props-') && scenario !== 'props-default' && scenario !== 'props-style' || scenario.startsWith('render-') || ['lifecycle', 'events', 'events-prevent', 'render-override', 'class-value-render', 'class-value-callback-render'].includes(scenario));
  const wrapped = $derived(scenario.startsWith('render-') && !scenario.includes('class') && scenario !== 'render-override');
  const classes = $derived(scenario === 'class' ? 'test-class' : scenario === 'render-class' ? 'component-classname' : scenario === 'render-class-resolved' ? () => 'conditional-component-classname' : ['reactive', 'lifecycle', 'override', 'render-override'].includes(scenario) ? (state: SeparatorState) => `orientation-${state.orientation}` : scenario === 'class-value-callback-render' ? (state: SeparatorState) => ['array-class', [{ 'object-class': true }, [`orientation-${state.orientation}`]]] : scenario.startsWith('class-value') ? ['array-class', [{ 'object-class': true }, ['nested-class']]] : undefined);
  const style = $derived(scenario === 'props-style' ? 'color: green' : scenario === 'reactive' ? (state: SeparatorState) => state.orientation === 'vertical' ? 'color: red' : 'color: green' : undefined);
  onMount(() => { hydrated = true; });
</script>
{#snippet replacement(props: Record<string | symbol, unknown>, state: SeparatorState, children: import('svelte').Snippet | undefined)}
  {#if wrapped}
    <div data-testid="base-ui-wrapper"><div {...props} data-testid="wrapped" data-test-value={scenario === 'render-empty-element' ? undefined : 'source-value'} bind:this={renderRef}>{@render children?.()}</div></div>
  {:else}
    {const replacementProps = $derived(mergeProps(props, {
      ...(scenario.includes('class') ? { class: 'render-prop-classname' } : {}),
      ...(scenario.includes('style') ? { style: 'color: green' } : {}),
      ...(scenario === 'render-override' ? { role: 'presentation', 'aria-orientation': 'vertical', 'data-orientation': 'replacement' } : {}),
      ...(scenario.startsWith('events') ? { onclick: (event: Event & { preventBaseUIHandler(): void }) => { calls = [...calls, 'render']; if (scenario === 'events-prevent') event.preventBaseUIHandler(); } } : {})
    }))}
    <svelte:element this={scenario === 'lifecycle' ? tag : 'div'} {...replacementProps}
      data-testid={scenario.includes('class') ? 'test-component' : 'custom-root'} data-render-state={state.orientation} bind:this={renderRef}>{@render children?.()}</svelte:element>
  {/if}
{/snippet}
<main data-hydrated={hydrated}>
  <button onclick={() => orientation = 'vertical'}>vertical</button><button onclick={() => orientation = 'horizontal'}>horizontal</button>
  <button onclick={() => mode = 'updated'}>update props</button><button onclick={() => tag = 'article'}>replace host</button>
  <button onclick={() => mounted = false}>remove</button><button onclick={() => mounted = true}>restore</button>
  <output data-testid="events">{JSON.stringify(calls)}</output>
  <output data-testid="refs">{JSON.stringify({ present: !!ref, instanceofDiv: hydrated && ref instanceof HTMLDivElement, renderPresent: !!renderRef, tag: ref?.tagName, testid: ref?.getAttribute('data-testid'), renderTag: renderRef?.tagName, renderTestid: renderRef?.getAttribute('data-testid'), same: !!ref && ref === renderRef, attached: !!ref && ref === attachmentNode, cleanups })}</output>
  {#if mounted}
    <Separator {orientation} bind:ref render={customized ? replacement : undefined} class={classes} {style} {...attachments}
      {...(scenario === 'override' ? { role: 'presentation' as const, 'aria-orientation': 'vertical' as const, 'data-orientation': 'consumer' } : {})}
      id={mode === 'updated' ? 'updated-separator' : 'tested-separator'} onclick={() => calls = [...calls, mode === 'updated' ? 'updated-part' : 'part']}
      data-testid={scenario === 'props-style' ? 'custom-root' : 'root'} lang={scenario.startsWith('props-') ? 'fr' : undefined} data-foobar={scenario.startsWith('props-') ? 'source-value' : undefined} data-mode={mode}>
      {#if ['lifecycle', 'reactive'].includes(scenario)}Separator content{/if}
    </Separator>
  {/if}
</main>
<style>
  :global([data-testid='root']), :global([data-testid='custom-root']), :global([data-testid='wrapped']) { min-height: 2px; min-width: 2px; }
</style>
