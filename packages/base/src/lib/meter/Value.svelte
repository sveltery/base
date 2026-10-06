<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Adapted from pinned MeterValue; MIT: THIRD_PARTY_NOTICES.md.
  import { getMeterContext } from './context.js';
  import { emptyState } from './helpers.js';
  import type { MeterValueProps } from './types.js';
  let {
    children,
    render,
    class: classProp,
    style,
    ref = $bindable(),
    ...props
  }: MeterValueProps = $props();
  const context = getMeterContext();
  const state = emptyState;
  const internal = { 'aria-hidden': true };

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

{#snippet content()}
  {#if children}{@render children(
      context.formattedValue,
      context.value,
    )}{:else}{context.formattedValue}{/if}
{/snippet}
{#if render}
  {@render render(mergedProps, state, content)}
{:else}
  <span {...mergedProps}>{@render content?.()}</span>
{/if}
