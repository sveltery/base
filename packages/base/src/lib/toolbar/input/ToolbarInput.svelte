<script lang="ts">
  // Source-ordered Base UI v1.8.0 ToolbarInput.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import { useFocusableWhenDisabled } from '../../utils/useFocusableWhenDisabled.js';
  import { useToolbarRootContext } from '../root/ToolbarRootContext.js';
  import { useToolbarGroupContext } from '../group/ToolbarGroupContext.js';
  import CompositeItem from '../../internals/composite/item/CompositeItem.svelte';
  import type { ToolbarInputProps, ToolbarInputState } from '../types.js';
  let {
    class: classProp,
    focusableWhenDisabled = true,
    render,
    disabled: disabledProp = false,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ToolbarInputProps = $props();
  const toolbar = useToolbarRootContext();
  const groupContext = useToolbarGroupContext();
  const disabled = $derived(toolbar.disabled || (groupContext?.disabled ?? false) || disabledProp);
  const itemMetadata = $derived({ disabled, focusableWhenDisabled });
  const focusableWhenDisabledProps = $derived(
    useFocusableWhenDisabled({
      composite: true,
      disabled,
      focusableWhenDisabled,
      isNativeButton: false,
    }).props,
  );
  const state: ToolbarInputState = $derived({
    disabled,
    orientation: toolbar.orientation,
    focusable: focusableWhenDisabled,
  });
  function preventWhenDisabled(event: Event) {
    if (disabled) event.preventDefault();
  }
  const defaultProps = {
    onclick: preventWhenDisabled,
    onpointerdown: preventWhenDisabled,
  };
  const rendererProps = $derived([defaultProps, elementProps, focusableWhenDisabledProps]);
</script>

<CompositeItem
  tag="input"
  {render}
  class={classProp}
  {style}
  metadata={itemMetadata}
  {state}
  bind:ref
  props={rendererProps}
  {children}
/>
