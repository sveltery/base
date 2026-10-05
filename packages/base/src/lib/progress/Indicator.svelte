<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Adapted from pinned ProgressIndicator; MIT: THIRD_PARTY_NOTICES.md.
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getProgressContext } from './context.js';
  import { statusAttributes } from './helpers.js';
  import type { ProgressIndicatorProps } from './types.js';
  let { children, render, class: classProp, ref = $bindable(), ...props }: ProgressIndicatorProps = $props();
  const context = getProgressContext();
  const state = $derived(context.state);
  const internal = $derived({ ...statusAttributes(state.status), style: context.percentageValue == null ? undefined : `inset-inline-start:0;height:inherit;width:${context.percentageValue}%` });
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
{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
