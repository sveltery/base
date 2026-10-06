<script lang="ts">
  // Derived from Base UI v1.8.0 ToastClose; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import RenderContent from './RenderContent.svelte';
  import { root } from './root-context.js';
  import { provider } from './context.js';
  import type { ToastCloseProps } from './types.js';

  let {
    render,
    children,
    disabled = false,
    nativeButton = true,
    class: classProp,
    style,
    ref = $bindable(),
    ...elementProps
  }: ToastCloseProps = $props();
  const controller = root();
  const { store } = provider();
  let hasFocus = $state(false);
  const state = $derived({ type: controller.toast.type });
  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    native: nativeButton,
  }));
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      buttonRef(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          buttonRef(null);
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(state, { class: classProp, style }, [
      {
        'aria-hidden': !controller.expanded && !hasFocus,
        onclick: () => store.closeToast(controller.toast.id),
        onfocus: () => {
          hasFocus = true;
        },
        onblur: () => {
          hasFocus = false;
        },
      },
      elementProps,
      getButtonProps,
    ]),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#snippet hostChildren()}<RenderContent content={children} />{/snippet}
{#if render}
  {@render render(mergedProps, state, hostChildren)}
{:else}
  <button {...mergedProps}>{@render hostChildren()}</button>
{/if}
