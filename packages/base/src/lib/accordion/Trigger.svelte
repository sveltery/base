<script lang="ts">
  // Adapted from AccordionTrigger, Base UI v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT.
  import { untrack } from 'svelte';
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { getButtonProps } from '../button/props.js';
  import { mergeProps } from '../merge-props/index.js';
  import { getCollapsibleContext } from '../collapsible/context.js';
  import { getAccordionItemContext } from './context.js';
  import { stateAttributes } from './state.js';
  import type { AccordionTriggerProps } from './types.js';
  let { children, render, disabled: disabledProp, nativeButton = true, id: idProp, class: classProp, ref = $bindable(), ...props }: AccordionTriggerProps = $props();
  const context = getCollapsibleContext();
  const item = getAccordionItemContext();
  const disabled = $derived(Boolean(disabledProp || context.disabled));
  const registeredId = $derived(idProp || undefined);
  const id = $derived(registeredId ?? item.defaultTriggerId);
  const state = $derived(item.state);
  const resolved = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(state) : classProp;
    return getButtonProps(mergeProps({
      ...stateAttributes(state, true),
      'aria-controls': context.open ? context.panelId : undefined,
      'aria-expanded': context.open,
      id,
      onclick: context.handleTrigger,
    }, { ...props, class: classValue === undefined ? undefined : resolveClassValue(classValue) }), disabled, true, nativeButton);
  });
  $effect(() => {
    const registered = registeredId;
    untrack(() => item.setTriggerId(current => registered ?? (current === null ? undefined : current)));
    return () => untrack(() => item.setTriggerId(current => current === registered ? null : current));
  });
</script>
<Element tag="button" internal={render ? {} : { type: 'button' }} props={resolved} {state} {render} {children} bind:ref />
