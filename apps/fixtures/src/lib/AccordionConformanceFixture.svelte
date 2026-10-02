<script lang="ts">
  // Svelte adaptations of the five pinned describeConformance invocations; separate from ordinary assertions.
  import { onMount, type Snippet } from 'svelte';
  import { Accordion, type AccordionItemState } from '@sveltery/base';
  import { mergeProps } from '../../../../packages/base/src/lib/merge-props/index.js';
  import type { HTMLAttributes } from 'svelte/elements';
  let { part, mode }: { part: string; mode: string } = $props();
  let hydrated = $state(false), ref = $state<HTMLElement | null>(), renderRef = $state<HTMLElement | null>();
  onMount(() => { hydrated = true; });
  const custom = $derived(!['default', 'style', 'class'].includes(mode));
  const wrapped = $derived(mode.startsWith('wrapper'));
  const classProp = $derived(mode === 'resolved-class' ? () => 'conditional-component-classname' : mode === 'class' ? 'test-class' : 'component-classname');
  const testedProps = $derived({ 'data-testid': 'conformance', lang: 'fr', 'data-foobar': 'foobar', class: classProp, style: mode === 'style' ? 'color: green' : undefined });
  function refInstance(node: HTMLElement | null | undefined) { if (!node) return false; const view = node.ownerDocument.defaultView as Window & typeof globalThis; return node instanceof (part === 'Trigger' && !custom ? view.HTMLButtonElement : part === 'Header' && !custom ? view.HTMLHeadingElement : view.HTMLDivElement); }
</script>
{#snippet replacement(supplied: Record<string | symbol, unknown>, _state: AccordionItemState, children: Snippet | undefined)}
  {#if wrapped}<div data-testid="wrapper"><div {...supplied as HTMLAttributes<HTMLDivElement>} data-test-value="test-value" bind:this={renderRef}>{@render children?.()}</div></div>
  {:else}<div {...mergeProps(supplied, { class: mode === 'function' || mode === 'function-style' || mode === 'ref-function' ? undefined : 'render-prop-classname', style: mode.endsWith('-style') ? 'color: green' : undefined }) as HTMLAttributes<HTMLDivElement>} data-test-value="test-value" bind:this={renderRef}>{@render children?.()}</div>{/if}
{/snippet}
{#snippet rootReplacement(supplied: Record<string | symbol, unknown>, _state: unknown, children: Snippet | undefined)}{@render replacement(supplied, {} as AccordionItemState, children)}{/snippet}
{#snippet tested()}
  {#if part === 'Root'}<Accordion.Root {...testedProps} bind:ref render={custom ? rootReplacement : undefined}/>
  {:else if part === 'Item'}<Accordion.Item {...testedProps} bind:ref render={custom ? replacement : undefined}/>
  {:else if part === 'Header'}<Accordion.Header {...testedProps} bind:ref render={custom ? replacement : undefined}/>
  {:else if part === 'Trigger'}<Accordion.Trigger {...testedProps} bind:ref nativeButton={!custom} render={custom ? replacement : undefined}/>
  {:else}<Accordion.Panel keepMounted {...testedProps} bind:ref render={custom ? replacement : undefined}/>{/if}
{/snippet}
<main data-hydrated={hydrated}>
  {#if part === 'Root'}{@render tested()}{:else if part === 'Item'}<Accordion.Root>{@render tested()}</Accordion.Root>{:else}<Accordion.Root><Accordion.Item>{@render tested()}</Accordion.Item></Accordion.Root>{/if}
  <output data-testid="ref-instance">{refInstance(ref)}</output><output data-testid="ref-id">{ref?.getAttribute('data-testid')}</output><output data-testid="render-ref-id">{renderRef?.getAttribute('data-testid')}</output><output data-testid="ref-identity">{ref === renderRef}</output><output data-testid="ref">{ref?.tagName}</output><output data-testid="render-ref">{renderRef?.tagName}</output>
</main>
