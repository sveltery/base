<script lang="ts">
  // Derived from Base UI v1.8.0 ToastAction; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import RenderContent from './RenderContent.svelte';
  import { isRenderableContent } from './content.js';
  import { root } from './root-context.js';
  import type { ToastActionComponentProps } from './types.js';

  let {
    render,
    children,
    disabled = false,
    nativeButton = true,
    class: classProp,
    style,
    ref = $bindable(),
    ...elementProps
  }: ToastActionComponentProps = $props();
  const controller = root();
  const content = $derived(controller.toast.actionProps?.children ?? children);
  const state = $derived({ type: controller.toast.type });
  const actionProps = $derived.by(() => {
    const { children: _children, ...attributes } = controller.toast.actionProps ?? {};
    void _children;
    return attributes;
  });
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
      elementProps,
      actionProps,
      getButtonProps,
    ]),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if isRenderableContent(content)}
  {#snippet hostChildren()}<RenderContent {content} />{/snippet}
  {#if render}
    {@render render(mergedProps, state, hostChildren)}
  {:else}
    <button {...mergedProps}>{@render hostChildren()}</button>
  {/if}
{/if}
