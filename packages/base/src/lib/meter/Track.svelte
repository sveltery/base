<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Adapted from pinned MeterTrack; MIT: THIRD_PARTY_NOTICES.md.
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { emptyState } from './helpers.js';
  import type { MeterTrackProps } from './types.js';
  let { children, render, class: classProp, ref = $bindable(), ...props }: MeterTrackProps = $props();
  const state = emptyState;
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
  return { ...mergeComponentProps(state, { class: className, style }, [{}, attributes], false), [hostAttachmentKey]: attachHost };
});
</script>
{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
