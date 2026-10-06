<script lang="ts">
  // Source composition from Base UI v1.8.0 CollapsibleTrigger.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';
  import { triggerOpenStateMapping } from '../utils/collapsibleOpenStateMapping.js';
  import { transitionStatusMapping } from '../internals/stateAttributesMapping.js';
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import { getCollapsibleContext } from './context.js';
  import type { CollapsibleTriggerProps } from './types.js';

  const stateAttributesMapping = { ...triggerOpenStateMapping, ...transitionStatusMapping };
  let {
    children,
    class: className,
    disabled: disabledProp,
    render,
    nativeButton = true,
    style,
    ref = $bindable(),
    ...elementProps
  }: CollapsibleTriggerProps = $props();
  const context = getCollapsibleContext();
  const disabled = $derived(disabledProp ?? context.disabled);
  const button = useButton(() => ({ disabled, focusableWhenDisabled: true, native: nativeButton }));
  const { getButtonProps, buttonRef } = button;
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      buttonRef(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (button.element === host) buttonRef(null);
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      context.state,
      { class: className, style },
      [
        {
          'aria-controls': context.open ? context.panelId : undefined,
          'aria-expanded': context.open,
          onclick: context.handleTrigger,
        },
        elementProps,
        getButtonProps,
      ],
      stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, context.state, children)}
{:else}
  <button type="button" {...mergedProps}>{@render children?.()}</button>
{/if}
