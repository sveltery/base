<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Adapted from pinned MeterTrack; MIT: THIRD_PARTY_NOTICES.md.
  import { emptyState } from './helpers.js';
  import type { MeterTrackProps } from './types.js';
  let {
    children,
    render,
    class: classProp,
    style,
    ref = $bindable(),
    ...props
  }: MeterTrackProps = $props();
  const state = emptyState;

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
  const mergedProps = $derived({
    ...mergeComponentProps(state, { class: classProp, style }, props, false),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
