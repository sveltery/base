<script lang="ts">
  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
  import RenderElement from '../internals/RenderElement.svelte';
  import { usePopoverRootContext } from './context.js';
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import { getContext, untrack } from 'svelte';
  import { ClosePartContext, type ClosePartContextValue } from '../utils/closePart.svelte.js';
  import type { PopoverCloseProps } from './types.js';
  let {
    render,
    class: className,
    style,
    children,
    disabled = false,
    nativeButton = true,
    // eslint-disable-next-line no-useless-assignment -- Native bindable ref output is published through the ordered Source ref callback.
    ref = $bindable(),
    ...elementProps
  }: PopoverCloseProps = $props();
  const { buttonRef, getButtonProps } = useButton(() => ({
    disabled,
    focusableWhenDisabled: false,
    native: nativeButton,
  }));
  const store = usePopoverRootContext();
  const closePart = getContext<ClosePartContextValue | undefined>(ClosePartContext);
  $effect(() => untrack(() => closePart?.register()));
  const forwardedRef = (node: HTMLElement | null) => {
    ref = node;
  };
</script>

<RenderElement
  tag="button"
  componentProps={{ render, class: className, style }}
  params={{
    ref: [forwardedRef, buttonRef],
    props: [
      {
        onclick(event: MouseEvent) {
          store.setOpen(false, createChangeEventDetails(REASONS.closePress, event));
        },
      },
      elementProps,
      getButtonProps,
    ],
  }}
  {children}
/>
