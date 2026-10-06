<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Adapted from Base UI v1.8.0 AccordionHeader, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT.
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

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived.by(() => {
    const { class: className, style, ...attributes } = resolved;
    return {
      ...mergeComponentProps(
        state,
        { class: className, style },
        [stateAttributes(state), attributes],
        false,
      ),
      [hostAttachmentKey]: attachHost,
    };
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <h3 {...mergedProps}>{@render children?.()}</h3>
{/if}
