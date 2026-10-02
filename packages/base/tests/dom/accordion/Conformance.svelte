<script lang="ts">
  // Native Svelte adaptations of Base UI's shared conformance assertions; MIT attribution in parity/accordion.
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { createAttachmentKey } from 'svelte/attachments';
  import { Accordion } from '../../../src/lib/accordion/index.js';
  import { mergeProps } from '../../../src/lib/merge-props/index.js';
  let { part = 'Root', mode = 'default' }: { part?: keyof typeof Accordion; mode?: string } = $props();
  const Part = $derived(Accordion[part]);
  let ref = $state<HTMLElement | null>(null);
  let renderRef = $state<HTMLElement | null>(null);
  const key = createAttachmentKey();
  function rendered(node: HTMLElement) { renderRef = node; return () => { if (renderRef === node) renderRef = null; }; }
  const classValue = $derived(mode === 'class' ? 'test-class' : mode === 'merged-class' ? 'component-classname' : mode === 'resolved-class' ? () => 'conditional-component-classname' : undefined);
  const replacement = $derived(['function', 'element', 'function-style', 'element-style', 'wrapper-function', 'wrapper-element', 'wrapper-empty', 'ref-function', 'refs-element', 'merged-class', 'resolved-class'].includes(mode));
  export function refs() { return { ref, renderRef }; }
  function customProps(props: Record<string | symbol, unknown>) {
    const result = mergeProps(props, { style: mode === 'function-style' || mode === 'element-style' ? 'color:green' : undefined,
      class: mode === 'merged-class' || mode === 'resolved-class' ? 'render-prop-classname' : undefined });
    for (const symbol of Object.getOwnPropertySymbols(props)) result[symbol] = props[symbol];
    if (mode === 'refs-element') result[key] = rendered;
    return result;
  }
</script>
{#snippet custom(props: Record<string | symbol, unknown>, _state: unknown, children: Snippet | undefined)}
  {#if mode.startsWith('wrapper')}
    <div data-testid="base-ui-wrapper"><div {...customProps(props) as HTMLAttributes<HTMLDivElement>} data-test-value={mode === 'wrapper-empty' ? undefined : 'test-value'}>{@render children?.()}</div></div>
  {:else}
    <div {...customProps(props) as HTMLAttributes<HTMLDivElement>}>{@render children?.()}</div>
  {/if}
{/snippet}
<Accordion.Root><Accordion.Item>
  <Part data-testid="conformance" lang="fr" data-foobar="test-value" keepMounted={part === 'Panel' ? true : undefined}
    nativeButton={part === 'Trigger' && replacement ? false : undefined} class={classValue} style={mode === 'style' ? 'color:green' : undefined}
    render={replacement ? custom : undefined} bind:ref />
</Accordion.Item></Accordion.Root>
