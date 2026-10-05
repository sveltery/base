<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Adapted from pinned MeterLabel; MIT: THIRD_PARTY_NOTICES.md.
  import { getMeterContext } from './context.js';
  import { emptyState } from './helpers.js';
  import type { MeterLabelProps } from './types.js';
  let {
    children,
    id: idProp,
    render,
    class: classProp,
    style,
    ref = $bindable(),
    ...props
  }: MeterLabelProps = $props();
  const context = getMeterContext();
  const state = emptyState;
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
  const internal = $derived({ id, role: 'presentation' });

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
