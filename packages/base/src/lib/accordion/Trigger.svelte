<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Adapted from AccordionTrigger, Base UI v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT.
  import { untrack } from 'svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getButtonProps } from '../button/props.js';
  import { mergeProps } from '../merge-props/index.js';
  import { getCollapsibleContext } from '../collapsible/context.js';
  import { getAccordionItemContext } from './context.js';
  import { stateAttributes } from './state.js';
  import type { AccordionTriggerProps } from './types.js';
  let {
    children,
    render,
    disabled: disabledProp,
    nativeButton = true,
    id: idProp,
    class: classProp,
    ref = $bindable(),
    ...props
  }: AccordionTriggerProps = $props();
  const context = getCollapsibleContext();
  const item = getAccordionItemContext();
  const disabled = $derived(Boolean(disabledProp || context.disabled));
  const registeredId = $derived(idProp || undefined);
  const id = $derived(registeredId ?? item.defaultTriggerId);
  const state = $derived(item.state);
  const resolved = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(state) : classProp;
    const className = classValue === undefined ? undefined : resolveClassValue(classValue);
    return {
      ...getButtonProps(
        mergeProps(
          {
            ...stateAttributes(state, true),
            'aria-controls': context.open ? context.panelId : undefined,
            'aria-expanded': context.open,
            id,
            onclick: context.handleTrigger,
          },
          {
            ...props,
            class: className,
          },
        ),
        disabled,
        true,
        nativeButton,
      ),
      class: className,
      style: props.style,
    };
  });
  $effect(() => {
    const registered = registeredId;
    untrack(() =>
      item.setTriggerId((current) => registered ?? (current === null ? undefined : current)),
    );
    return () =>
      untrack(() => item.setTriggerId((current) => (current === registered ? null : current)));
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
