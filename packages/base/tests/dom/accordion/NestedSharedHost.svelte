<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    Accordion,
    type AccordionItemProps,
    type AccordionItemState,
  } from '../../../src/lib/accordion/index.js';
  const outerIndexes: number[] = [];
  const innerIndexes: number[] = [];
  function outer(state: AccordionItemState) {
    outerIndexes.push(state.index);
    return '';
  }
  function inner(state: AccordionItemState) {
    innerIndexes.push(state.index);
    return '';
  }
  export function indexes() {
    return { outer: outerIndexes.at(-1), inner: innerIndexes.at(-1) };
  }
</script>

{#snippet sharedHost(
  props: Record<string | symbol, unknown>,
  _state: AccordionItemState,
  children: Snippet | undefined,
)}
  <Accordion.Item {...props as AccordionItemProps} class={inner} data-testid="shared-host"
    >{@render children?.()}</Accordion.Item
  >
{/snippet}
<Accordion.Root>
  <Accordion.Item render={sharedHost} class={outer}
    ><Accordion.Header>Shared header</Accordion.Header></Accordion.Item
  >
  <Accordion.Item data-testid="sibling">Sibling</Accordion.Item>
</Accordion.Root>
