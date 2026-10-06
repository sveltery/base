<!-- eslint-disable @typescript-eslint/no-explicit-any -- Preserve the pinned generic default. -->
<script lang="ts" generics="Value = any">
  // Adapted from AccordionRoot/useControlled/useStableCallback, mui/base-ui v1.8.0
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { onDestroy, untrack } from 'svelte';
  import { DEV } from 'esm-env';
  import Element from '../dialog/Element.svelte';
  import { resolveClassValue } from '../internals/resolveClassValue.js';
  import { errorOnce, warnOnce } from '../collapsible/animations.js';
  import { setAccordionRootContext } from './context.js';
  import { createItemList } from './list.js';
  import { EMPTY_VALUE, serializeToDevModeString } from './value.js';
  import type { AccordionRootProps, AccordionRootChangeEventDetails } from './types.js';
  let {
    children,
    render,
    disabled = false,
    hiddenUntilFound = false,
    keepMounted: keepMountedProp,
    loopFocus: _loopFocus,
    onValueChange,
    multiple = false,
    orientation = 'vertical',
    value: valueProp,
    defaultValue: defaultValueProp,
    class: classProp,
    ref = $bindable(),
    ...props
  }: AccordionRootProps<Value> = $props();
  // Deprecated upstream prop is deliberately stripped and has no keyboard behavior.
  untrack(() => _loopFocus);
  const keepMounted = $derived(keepMountedProp ?? false);
  const defaultValue = $derived(defaultValueProp ?? EMPTY_VALUE);
  const controlled = untrack(() => valueProp !== undefined);
  const initialDefault = untrack(() => defaultValue);
  let internalValue = $state.raw(initialDefault);
  const value = $derived(controlled && valueProp !== undefined ? valueProp : internalValue);
  const rootState = $derived({ value, disabled, orientation });
  const resolved = $derived.by(() => {
    const classValue = typeof classProp === 'function' ? classProp(rootState) : classProp;
    return {
      ...props,
      class: classValue === undefined ? undefined : resolveClassValue(classValue),
    };
  });
  const list = createItemList();
  onDestroy(list.destroy);
  let committedValue = untrack(() => value);
  let committedMultiple = untrack(() => multiple);
  let committedCallback = untrack(() => onValueChange);
  function handleValueChange(
    newValue: unknown,
    nextOpen: boolean,
    details: AccordionRootChangeEventDetails,
  ) {
    const itemValue = newValue as Value;
    const nextValue = !committedMultiple
      ? committedValue[0] === itemValue
        ? []
        : [itemValue]
      : nextOpen
        ? [...committedValue, itemValue]
        : committedValue.filter((entry) => entry !== itemValue);
    committedCallback?.(nextValue, details);
    if (!details.isCanceled && !controlled) internalValue = nextValue;
  }
  setAccordionRootContext({
    get value() {
      return value;
    },
    get disabled() {
      return disabled;
    },
    get state() {
      return rootState;
    },
    get hiddenUntilFound() {
      return hiddenUntilFound;
    },
    get keepMounted() {
      return keepMounted;
    },
    handleValueChange,
    registerItem: list.register,
  });
  $effect.pre(() => {
    committedValue = value;
    committedMultiple = multiple;
    committedCallback = onValueChange;
  });
  $effect(() => {
    if (hiddenUntilFound && keepMountedProp === false) {
      warnOnce(
        'The `keepMounted={false}` prop on `Accordion.Root` is ignored when `hiddenUntilFound` is enabled, since panels must remain mounted while closed.',
      );
    }
  });
  $effect(() => {
    if (DEV && controlled !== (valueProp !== undefined))
      errorOnce(
        `A component is changing the ${controlled ? '' : 'un'}controlled value state of Accordion to be ${controlled ? 'un' : ''}controlled.\nElements should not switch from uncontrolled to controlled (or vice versa).\nDecide between using a controlled or uncontrolled Accordion element for the lifetime of the component.\nThe nature of the state is determined during the first render. It's considered controlled if the value is not \`undefined\`.\nMore info: https://fb.me/react-controlled-components`,
      );
  });
  $effect(() => {
    if (
      DEV &&
      !controlled &&
      serializeToDevModeString(defaultValue) !== serializeToDevModeString(initialDefault)
    )
      errorOnce(
        'A component is changing the default value state of an uncontrolled Accordion after being initialized. To suppress this warning opt to use a controlled Accordion.',
      );
  });
</script>

<Element
  tag="div"
  internal={{ 'data-disabled': disabled ? '' : undefined, 'data-orientation': orientation }}
  props={resolved}
  state={rootState}
  {render}
  {children}
  bind:ref
/>
