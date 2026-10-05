<script lang="ts" generics="Value extends string = string">
  // Source-ordered Base UI v1.8.0 ToggleGroup.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
  import { useStableCallback } from '../utils/useStableCallback.js';
  import { useControlled } from '../utils/useControlled.svelte.js';
  import { EMPTY_ARRAY } from '../utils/empty.js';
  import RenderElement from '../internals/RenderElement.svelte';
  import CompositeRoot from '../internals/composite/root/CompositeRoot.svelte';
  import { useToolbarRootContext } from '../toolbar/root/ToolbarRootContext.js';
  import { useToolbarGroupContext } from '../toolbar/group/ToolbarGroupContext.js';
  import { setToggleGroupContext } from './ToggleGroupContext.js';
  import type {
    ToggleGroupProps,
    ToggleGroupState,
    ToggleGroupChangeEventDetails,
  } from './types.js';
  let {
    defaultValue: defaultValueProp,
    disabled: disabledProp = false,
    loopFocus = true,
    onValueChange,
    orientation = 'horizontal',
    multiple = false,
    value: valueProp,
    class: classProp,
    render,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ToggleGroupProps<Value> = $props();
  const toolbarContext = useToolbarRootContext(true);
  const toolbarGroupContext = useToolbarGroupContext();
  const defaultValue = $derived(defaultValueProp ?? EMPTY_ARRAY);
  const isValueInitialized = $derived(valueProp !== undefined || defaultValueProp !== undefined);
  const disabled = $derived(
    (toolbarContext?.disabled ?? false) || (toolbarGroupContext?.disabled ?? false) || disabledProp,
  );
  const [getGroupValue, setValueState] = useControlled<readonly Value[]>(() => ({
    controlled: valueProp,
    default: defaultValue,
    name: 'ToggleGroup',
    state: 'value',
  }));
  const groupValue = $derived(getGroupValue());
  const setGroupValue = useStableCallback(
    (newValue: Value, nextPressed: boolean, eventDetails: ToggleGroupChangeEventDetails) => {
      let newGroupValue: Value[];
      if (multiple) {
        newGroupValue = groupValue.slice();
        if (nextPressed) newGroupValue.push(newValue);
        else newGroupValue.splice(groupValue.indexOf(newValue), 1);
      } else {
        newGroupValue = nextPressed ? [newValue] : [];
      }
      onValueChange?.(newGroupValue, eventDetails);
      if (eventDetails.isCanceled) return;
      setValueState(newGroupValue);
    },
  );
  const state: ToggleGroupState = $derived({ disabled, multiple, orientation });
  setToggleGroupContext<Value>({
    get disabled() {
      return disabled;
    },
    setGroupValue,
    get value() {
      return groupValue;
    },
    get isValueInitialized() {
      return isValueInitialized;
    },
  });
  const defaultProps = { role: 'group' };
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(element: HTMLElement | null) {
      ref = element;
    },
  };
  const rendererProps = $derived([defaultProps, elementProps]);
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({ state, ref: forwardedRef, props: rendererProps });
</script>

{#if toolbarContext}
  <RenderElement tag="div" {componentProps} {params} {children} />
{:else}
  <CompositeRoot
    {render}
    class={classProp}
    {style}
    {state}
    refs={[forwardedRef]}
    props={rendererProps}
    {loopFocus}
    enableHomeAndEndKeys
    {orientation}
    {children}
  />
{/if}
