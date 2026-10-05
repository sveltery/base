<script lang="ts">
  // Derived from Base UI v1.8.0 Toast parts; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import Element from '../dialog/Element.svelte';
  import { root } from './root-context.js';
  import type { ToastContentProps } from './types.js';
  let { children, ref = $bindable(), ...props }: ToastContentProps = $props();
  const controller = root();
  const state = $derived({ expanded: controller.expanded, behind: controller.visibleIndex > 0 });
  const internal = $derived({
    'data-expanded': state.expanded ? '' : undefined,
    'data-behind': state.behind ? '' : undefined,
  });
  function attach(node: HTMLElement) {
    controller.recalculateHeight();
    const ownerWindow = node.ownerDocument.defaultView;
    if (!ownerWindow?.ResizeObserver || !ownerWindow.MutationObserver) return;
    const resize = new ownerWindow.ResizeObserver(() => controller.recalculateHeight(true));
    const mutation = new ownerWindow.MutationObserver(() => controller.recalculateHeight(true));
    resize.observe(node);
    mutation.observe(node, { childList: true, subtree: true, characterData: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }
</script>

<Element {internal} {props} {state} {children} {attach} bind:ref />
