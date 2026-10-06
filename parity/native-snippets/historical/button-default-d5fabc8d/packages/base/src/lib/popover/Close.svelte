<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';

  // Original Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT: THIRD_PARTY_NOTICES.md.
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

  const renderState = $derived({});
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      buttonRef?.(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          buttonRef?.(null);
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      renderState,
      { class: className, style: style },
      [
        {
          onclick(event: MouseEvent) {
            store.setOpen(false, createChangeEventDetails(REASONS.closePress, event));
          },
        },
        elementProps,
        getButtonProps,
      ],
      undefined,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, renderState, children)}
{:else}
  <button {...mergedProps}>{@render children?.()}</button>
{/if}
