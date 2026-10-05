<script lang="ts">
import { mergeComponentProps } from '../internals/mergeComponentProps.js';
import { createAttachmentKey } from 'svelte/attachments';
import { untrack } from 'svelte';

  // Derived from Base UI v1.8.0 Toast parts; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import RenderContent from './RenderContent.svelte';
  import { mergeButtonProps, nativeButtonProps } from './native-button.js';
  import { root } from './root-context.js';
  import { provider } from './context.js';
  import type { ToastCloseProps } from './types.js';
  let { children, disabled = false, ref = $bindable(), ...props }: ToastCloseProps = $props();
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

const hostAttachmentKey = createAttachmentKey();
function attachHost(host: HTMLElement) {
  return untrack(() => {
    ref = host;
    return () => untrack(() => {
      if (ref === host) ref = null;
    });
  });
}
const mergedProps = $derived.by(() => {
  const { class: className, style, ...attributes } = merged;
  return { ...mergeComponentProps(buttonState, { class: className, style }, [{}, attributes], false), [hostAttachmentKey]: attachHost };
});
</script>
{#snippet hostChildren()}
<RenderContent content={children} />
{/snippet}
<button {...mergedProps}>{@render hostChildren?.()}</button>
