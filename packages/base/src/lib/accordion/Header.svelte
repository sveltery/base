<script lang="ts">
  // Adapted from Base UI v1.8.0 AccordionHeader, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT.
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getAccordionItemContext } from './context.js';
  import { stateAttributes } from './state.js';
  import type { AccordionHeaderProps } from './types.js';
  let {
    children,
    render,
    class: classProp,
    ref = $bindable(),
    ...props
  }: AccordionHeaderProps = $props();
  const context = getAccordionItemContext();
  const state = $derived(context.state);
  const resolved = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(state) : classProp;
    return {
      ...props,
      class: classValue === undefined ? undefined : resolveClassValue(classValue),
    };
  });
</script>

<Element
  tag="h3"
  internal={stateAttributes(state)}
  props={resolved}
  {state}
  {render}
  {children}
  bind:ref
/>
