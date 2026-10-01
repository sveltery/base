<script lang="ts">
  // Derived from Base UI v1.8.0 Toast parts; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import RenderContent from './RenderContent.svelte';
  import { isRenderableContent } from './content.js';
  import { mergeButtonProps, nativeButtonProps } from './native-button.js';
  import { root } from './root-context.js';
  import type { ToastActionComponentProps } from './types.js';
  let { children, disabled = false, class: classProp, style: styleProp, ref = $bindable(null), ...props }: ToastActionComponentProps = $props();
  const controller = root();
  const content = $derived(controller.toast.actionProps?.children ?? children);
  const state = $derived({ type: controller.toast.type });
  const merged = $derived.by(() => {
    const { children: _children, ...actionProps } = controller.toast.actionProps ?? {};
    void _children;
    const mergedProps = nativeButtonProps(mergeButtonProps(props, actionProps), Boolean(disabled));
    const className = typeof classProp === 'function' ? classProp(state) : classProp;
    const style = typeof styleProp === 'function' ? styleProp(state) : styleProp;
    return {
      ...mergedProps,
      class: [className, mergedProps.class].filter(Boolean).join(' ') || undefined,
      style: [mergedProps.style, style].filter(Boolean).join(';') || undefined,
    };
  });
</script>
{#if isRenderableContent(content)}
  <Element tag="button" internal={{ 'data-type': state.type }} props={merged} {state} bind:ref>
    <RenderContent {content} />
  </Element>
{/if}
