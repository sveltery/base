<script lang="ts">
  // Derived from Base UI v1.8.0 Toast parts; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import RenderContent from './RenderContent.svelte';
  import { mergeButtonProps, nativeButtonProps } from './native-button.js';
  import { root } from './root-context.js';
  import { provider } from './context.js';
  import type { ToastCloseProps } from './types.js';
  let { children, disabled = false, ref = $bindable(null), ...props }: ToastCloseProps = $props();
  const controller = root();
  const { store } = provider();
  let hasFocus = $state(false);
  const buttonState = $derived({ type: controller.toast.type });
  const merged = $derived(nativeButtonProps(mergeButtonProps({
    'aria-hidden': !controller.expanded && !hasFocus,
    'data-type': buttonState.type,
    onclick: () => store.closeToast(controller.toast.id),
    onfocus: () => { hasFocus = true; },
    onblur: () => { hasFocus = false; },
  }, props), Boolean(disabled)));
</script>
<Element tag="button" props={merged} state={buttonState} bind:ref><RenderContent content={children} /></Element>
