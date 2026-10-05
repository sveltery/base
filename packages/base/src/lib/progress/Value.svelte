<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Adapted from pinned ProgressValue; MIT: THIRD_PARTY_NOTICES.md.
  import { getProgressContext } from './context.js';
  import { statusAttributes } from './helpers.js';
  import type { ProgressValueProps } from './types.js';
  let {
    children,
    render,
    class: classProp,
    style,
    ref = $bindable(),
    ...props
  }: ProgressValueProps = $props();
  const context = getProgressContext();
  const state = $derived(context.state);
  const internal = $derived({
    ...statusAttributes(state.status),
    'aria-hidden': true,
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
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: classProp, style },
      [internal, props],
      false,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#snippet content()}
  {#if children}{@render children(
      context.state.status === 'indeterminate'
        ? 'indeterminate'
        : context.formattedValue,
      context.value,
    )}{:else}{context.state.status === 'indeterminate'
      ? ''
      : context.formattedValue}{/if}
{/snippet}
{#if render}
  {@render render(mergedProps, state, content)}
{:else}
  <span {...mergedProps}>{@render content?.()}</span>
{/if}
