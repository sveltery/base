<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Adapted from pinned MeterValue; MIT: THIRD_PARTY_NOTICES.md.
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getMeterContext } from './context.js';
  import { emptyState } from './helpers.js';
  import type { MeterValueProps } from './types.js';
  let { children, render, class: classProp, ref = $bindable(), ...props }: MeterValueProps = $props();
  const context = getMeterContext();
  const state = emptyState;
  const internal = { 'aria-hidden': true };
  const resolved = $derived({ ...props, class: resolveClassValue(typeof classProp === 'function' ? classProp(state) : classProp) });

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
    });
  });
}
const mergedProps = $derived.by(() => {
  const { class: className, style, ...attributes } = resolved;
  return { ...mergeComponentProps(state, { class: className, style }, [internal, attributes], false), [hostAttachmentKey]: attachHost };
});
</script>
{#snippet content()}
  {#if children}{@render children(context.formattedValue, context.value)}{:else}{context.formattedValue}{/if}
{/snippet}
{#if render}
  {@render render(mergedProps, state, content)}
{:else}
  <span {...mergedProps}>{@render content?.()}</span>
{/if}
