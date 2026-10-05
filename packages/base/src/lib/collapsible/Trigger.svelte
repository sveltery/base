<script lang="ts">
  // Adapted from Base UI v1.8.0 CollapsibleTrigger. MIT: THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
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
          { ...props, class: classValue === undefined ? undefined : resolveClassValue(classValue) },
        ),
      },
      disabled,
      true,
      nativeButton,
    );
  });
</script>

<Element
  tag="button"
  internal={render ? {} : { type: 'button' }}
  props={resolved}
  {state}
  {render}
  {children}
  bind:ref
/>
