<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Adapted from pinned ProgressLabel; MIT: THIRD_PARTY_NOTICES.md.
  import { getProgressContext } from './context.js';
  import { statusAttributes } from './helpers.js';
  import type { ProgressLabelProps } from './types.js';
  let {
    children,
    id: idProp,
    render,
    class: classProp,
    style,
    ref = $bindable(),
    ...props
  }: ProgressLabelProps = $props();
  const context = getProgressContext();
  const state = $derived(context.state);
  const instanceId = $props.id();
  const generatedId = `base-ui-${instanceId}`;
  const id = $derived(idProp ?? generatedId);
  $effect(() => {
    const registered = id;
    context.setLabelId(registered);
    return () =>
      context.setLabelId((current) =>
        current === registered ? undefined : current,
      );
  });
  const internal = $derived({
    ...statusAttributes(state.status),
    id,
    role: 'presentation',
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

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <span {...mergedProps}>{@render children?.()}</span>
{/if}
