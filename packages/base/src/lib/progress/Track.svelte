<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Adapted from pinned ProgressTrack; MIT: THIRD_PARTY_NOTICES.md.
  import { getProgressContext } from './context.js';
  import { statusAttributes } from './helpers.js';
  import type { ProgressTrackProps } from './types.js';
  let {
    children,
    render,
    class: classProp,
    style,
    ref = $bindable(),
    ...props
  }: ProgressTrackProps = $props();
  const context = getProgressContext();
  const state = $derived(context.state);
  const internal = $derived({ ...statusAttributes(state.status) });

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
    ...mergeComponentProps(state, { class: classProp, style }, [internal, props], false),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
