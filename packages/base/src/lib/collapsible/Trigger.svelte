<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Adapted from Base UI v1.8.0 CollapsibleTrigger. MIT: THIRD_PARTY_NOTICES.md.
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getButtonProps } from '../button/props.js';
  import { mergeProps } from '../merge-props/index.js';
  import { getCollapsibleContext } from './context.js';
  import { stateAttributes } from './state.js';
  import type { CollapsibleTriggerProps } from './types.js';
  let {
    children,
    render,
    disabled: disabledProp,
    nativeButton = true,
    class: classProp,
    ref = $bindable(),
    ...props
  }: CollapsibleTriggerProps = $props();
  const context = getCollapsibleContext();
  const disabled = $derived(disabledProp ?? context.disabled);
  const state = $derived(context.state);
  const resolved = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(state) : classProp;
    return getButtonProps(
      {
        ...props,
        ...mergeProps(
          {
            ...stateAttributes(state, true),
            'aria-controls': context.open ? context.panelId : undefined,
            'aria-expanded': context.open,
            onclick: context.handleTrigger,
          },
          {
            ...props,
            class: classValue === undefined ? undefined : resolveClassValue(classValue),
          },
        ),
      },
      disabled,
      true,
      nativeButton,
    );
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
  const mergedProps = $derived.by(() => {
    const { class: className, style, ...attributes } = resolved;
    return {
      ...mergeComponentProps(
        state,
        { class: className, style },
        [render ? {} : { type: 'button' }, attributes],
        false,
      ),
      [hostAttachmentKey]: attachHost,
    };
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <button {...mergedProps}>{@render children?.()}</button>
{/if}
