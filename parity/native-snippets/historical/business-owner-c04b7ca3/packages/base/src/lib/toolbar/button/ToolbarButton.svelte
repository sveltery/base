<script lang="ts">
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  // Source-ordered Base UI v1.8.0 ToolbarButton.tsx; MIT: THIRD_PARTY_NOTICES.md.
  import { EMPTY_OBJECT } from '@sveltery/utils/empty';
  import { useButton } from '../../internals/use-button/useButton.svelte.js';
  import { useToolbarRootContext } from '../root/ToolbarRootContext.js';
  import { useToolbarGroupContext } from '../group/ToolbarGroupContext.js';
  import CompositeItem from '../../internals/composite/item/CompositeItem.svelte';
  import type { ToolbarButtonProps, ToolbarButtonState } from '../types.js';
  let {
    class: classProp,
    disabled: disabledProp = false,
    focusableWhenDisabled = true,
    render,
    nativeButton,
    style,
    children,
    ref = $bindable(),
    ...elementProps
  }: ToolbarButtonProps = $props();
  const toolbar = useToolbarRootContext();
  const groupContext = useToolbarGroupContext();
  const disabled = $derived(toolbar.disabled || (groupContext?.disabled ?? false) || disabledProp);
  const itemMetadata = $derived({ disabled, focusableWhenDisabled });
  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    focusableWhenDisabled,
    native: nativeButton,
  }));
  const state: ToolbarButtonState = $derived({
    disabled,
    orientation: toolbar.orientation,
    focusable: focusableWhenDisabled,
  });
  // Source forwards disabled to rendered components, while keeping default
  // focusable disabled native buttons hoverable for interactions such as tooltips.
  const rendererProps = $derived([
    elementProps,
    render ? { disabled } : EMPTY_OBJECT,
    getButtonProps,
  ]);
  const buttonAttachmentKey = createAttachmentKey();
  function attachButton(host: HTMLElement) {
    untrack(() => buttonRef(host));
    return () => untrack(() => buttonRef(null));
  }
</script>

<CompositeItem
  tag="button"
  {render}
  class={classProp}
  {style}
  metadata={itemMetadata}
  {state}
  bind:ref
  props={[...rendererProps, { [buttonAttachmentKey]: attachButton }]}
  {children}
/>
