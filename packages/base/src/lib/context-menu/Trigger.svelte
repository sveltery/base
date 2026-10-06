<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original ContextMenuTrigger renderer composition (MIT).
  import { pressableTriggerOpenStateMapping } from '../utils/popupStateMapping.js';
  import { createContextMenuTrigger } from './trigger/createContextMenuTrigger.svelte.js';
  import type { ContextMenuTriggerProps } from './types.js';
  let { ref = $bindable(null), ...props }: ContextMenuTriggerProps = $props();
  const trigger = createContextMenuTrigger(() => props);

  const renderSnippet = $derived(props.render);
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      trigger.triggerRef.current = host;
      ref = host;
      return () =>
        untrack(() => {
          if (trigger.triggerRef.current === host) trigger.triggerRef.current = null;
          if (ref === host) ref = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      trigger.state,
      { class: props.class, style: props.style },
      [trigger.props, trigger.elementProps],
      pressableTriggerOpenStateMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if renderSnippet}
  {@render renderSnippet(mergedProps, trigger.state, props.children)}
{:else}
  <div {...mergedProps}>{@render props.children?.()}</div>
{/if}
