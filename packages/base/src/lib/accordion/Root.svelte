<!-- eslint-disable @typescript-eslint/no-explicit-any -- Preserve the pinned generic default. -->
<script lang="ts" generics="Value = any">
  // Adapted from AccordionRoot/useControlled/useStableCallback, mui/base-ui v1.8.0
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { onDestroy, untrack } from 'svelte';
  import { Controlled } from '@sveltery/utils/Controlled';
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { warnOnce } from '../collapsible/animations.js';
  import { setAccordionRootContext } from './context.js';
  import { createItemList } from './list.js';
  import { EMPTY_VALUE } from './value.js';
  import type { AccordionRootProps, AccordionRootChangeEventDetails } from './types.js';
  let { children, render, disabled = false, hiddenUntilFound = false, keepMounted: keepMountedProp,
    loopFocus: _loopFocus, onValueChange, multiple = false, orientation = 'vertical',
    value: valueProp, defaultValue: defaultValueProp, class: classProp, ref = $bindable(), ...props }: AccordionRootProps<Value> = $props();
  // Deprecated upstream prop is deliberately stripped and has no keyboard behavior.
  untrack(() => _loopFocus);
  const keepMounted = $derived(keepMountedProp ?? false);
  const valueState = new Controlled(() => valueProp, untrack(() => defaultValueProp ?? EMPTY_VALUE));
  const value = $derived(valueState.value);
  const rootState = $derived({ value, disabled, orientation });
  const resolved = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(rootState) : classProp;
    return { ...props, class: classValue === undefined ? undefined : resolveClassValue(classValue) };
  });
  const list = createItemList();
  onDestroy(list.destroy);
  function handleValueChange(newValue: unknown, nextOpen: boolean, details: AccordionRootChangeEventDetails) {
    const itemValue = newValue as Value;
    const nextValue = !multiple ? value[0] === itemValue ? [] : [itemValue]
      : nextOpen ? [...value, itemValue] : value.filter(entry => entry !== itemValue);
    onValueChange?.(nextValue, details);
    if (!details.isCanceled) valueState.set(nextValue);
  }
  setAccordionRootContext({
    get value() { return value; }, get disabled() { return disabled; }, get state() { return rootState; },
    get hiddenUntilFound() { return hiddenUntilFound; }, get keepMounted() { return keepMounted; },
    handleValueChange, registerItem: list.register,
  });
  $effect(() => {
    if (hiddenUntilFound && keepMountedProp === false) {
      warnOnce('The `keepMounted={false}` prop on `Accordion.Root` is ignored when `hiddenUntilFound` is enabled, since panels must remain mounted while closed.');
    }
  });
</script>
<Element tag="div" internal={{ 'data-disabled': disabled ? '' : undefined, 'data-orientation': orientation }} props={resolved} state={rootState} {render} {children} bind:ref />
