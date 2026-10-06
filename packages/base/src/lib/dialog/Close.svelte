<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original DialogClose business/render/button composition (MIT).
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import { useDialogRootContext } from './context.js';
  import type { DialogCloseProps } from './types.js';
  let {
    children,
    render,
    class: className,
    style,
    disabled = false,
    nativeButton = true,
    ref = $bindable(),
    ...elementProps
  }: DialogCloseProps = $props();
  const store = useDialogRootContext();
  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    native: nativeButton,
  }));
  const state = $derived({ disabled });
  function handleClick(event: MouseEvent) {
    if (store.select('open'))
      store.setOpen(false, createChangeEventDetails(REASONS.closePress, event));
  }

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
      state,
      { class: className, style: style },
      [{ onclick: handleClick }, elementProps, getButtonProps],
      undefined,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <button type="button" {...mergedProps}>{@render children?.()}</button>
{/if}
