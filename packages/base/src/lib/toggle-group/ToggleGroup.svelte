<script lang="ts" generics="Value extends string = string">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';

  // Source-ordered Base UI v1.8.0 ToggleGroup.tsx at
  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.

  import { untrack } from 'svelte';
  import { Controlled } from '@sveltery/utils/Controlled';
  import { EMPTY_ARRAY } from '@sveltery/utils/empty';
  import CompositeRoot from '../internals/composite/root/CompositeRoot.svelte';
  import { useToolbarRootContext } from '../toolbar/root/ToolbarRootContext.js';
  import { useToolbarGroupContext } from '../toolbar/group/ToolbarGroupContext.js';
  import { setToggleGroupContext } from './ToggleGroupContext.js';
  import type { ToggleGroupProps, ToggleGroupState, ToggleGroupChangeEventDetails } from './types.js';
  let {
    defaultValue: defaultValueProp, disabled: disabledProp = false, loopFocus = true,
    onValueChange, orientation = 'horizontal', multiple = false, value: valueProp,
    class: classProp, render, style, children, ref = $bindable(), ...elementProps
  }: ToggleGroupProps<Value> = $props();
  const toolbarContext = useToolbarRootContext(true);
  const toolbarGroupContext = useToolbarGroupContext();
  const isValueInitialized = $derived(valueProp !== undefined || defaultValueProp !== undefined);
  const disabled = $derived((toolbarContext?.disabled ?? false) || (toolbarGroupContext?.disabled ?? false) || disabledProp);
  const valueState = new Controlled<readonly Value[]>(() => valueProp, untrack(() => defaultValueProp ?? EMPTY_ARRAY));
  const groupValue = $derived(valueState.value);
  const setGroupValue = (newValue: Value, nextPressed: boolean, eventDetails: ToggleGroupChangeEventDetails) => {
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
    valueState.set(newGroupValue);
  };
  const state: ToggleGroupState = $derived({ disabled, multiple, orientation });
  setToggleGroupContext<Value>({
    get disabled() { return disabled; }, setGroupValue,
    get value() { return groupValue; },
    get isValueInitialized() { return isValueInitialized; },
  });
  const defaultProps = { role: 'group' };
  
  const rendererProps = $derived([defaultProps, elementProps]);
  
  

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
    });
  });
}
const mergedProps = $derived({ ...mergeComponentProps(state, { class: classProp, style: style }, rendererProps, undefined), [hostAttachmentKey]: attachHost });
</script>
{#if toolbarContext}
  {#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
{:else}
  <CompositeRoot {render} class={classProp} {style} {state} bind:ref props={[...rendererProps, { [hostAttachmentKey]: attachHost }]} {loopFocus} enableHomeAndEndKeys {orientation} {children} />
{/if}
