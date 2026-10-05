<script lang="ts">
  // Derived from Base UI v1.8.0 Toast parts; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import RenderContent from './RenderContent.svelte';
  import { isRenderableContent } from './content.js';
  import { mergeButtonProps, nativeButtonProps } from './native-button.js';
  import { root } from './root-context.js';
  import type { ToastActionComponentProps } from './types.js';
  let {
    render,
    children,
    disabled = false,
    class: classProp,
    style: styleProp,
    ref = $bindable(),
    ...props
  }: ToastActionComponentProps = $props();
  const controller = root();
  const content = $derived(controller.toast.actionProps?.children ?? children);
  const state = $derived({ type: controller.toast.type });
  const merged = $derived.by(() => {
    const { children: _children, ...actionProps } =
      controller.toast.actionProps ?? {};
    void _children;
    const mergedProps = nativeButtonProps(
      mergeButtonProps(props, actionProps),
      Boolean(disabled),
    );
    const className =
      typeof classProp === 'function' ? classProp(state) : classProp;
    const style =
      typeof styleProp === 'function' ? styleProp(state) : styleProp;
    return {
      ...mergedProps,
      // Keep native ClassValue intact for Svelte's class attribute normalization.
      class:
        className || mergedProps.class
          ? [className, mergedProps.class]
          : undefined,
      style: [mergedProps.style, style].filter(Boolean).join(';') || undefined,
    };
  });
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    ref = host;
    return () => {
      if (ref === host) ref = null;
    };
  }
  const mergedProps = $derived.by(() => {
    const { class: className, style, ...attributes } = merged;
    return {
      ...mergeComponentProps(
        state,
        { class: className, style },
        [{ 'data-type': state.type }, attributes],
        false,
      ),
      [hostAttachmentKey]: attachHost,
    };
  });
</script>

{#if isRenderableContent(content)}
  {#if render}
    {@render render(mergedProps, state, children)}
  {:else}
    <button {...mergedProps}>
      <RenderContent {content} />
    </button>
  {/if}
{/if}
