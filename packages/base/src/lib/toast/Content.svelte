<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Derived from Base UI v1.8.0 Toast parts; MIT, see ../../../THIRD_PARTY_NOTICES.md.
  import { ownerWindow } from '@sveltery/utils/owner';
  import { root } from './root-context.js';
  import type { ToastContentProps } from './types.js';
  let { render, children, ref = $bindable(), ...props }: ToastContentProps = $props();
  const controller = root();
  const state = $derived({
    expanded: controller.expanded,
    behind: controller.visibleIndex > 0,
  });
  const internal = $derived({
    'data-expanded': state.expanded ? '' : undefined,
    'data-behind': state.behind ? '' : undefined,
  });
  function attach(node: HTMLElement) {
    controller.recalculateHeight();
    const win = ownerWindow(node);
    if (typeof win.ResizeObserver !== 'function' || typeof win.MutationObserver !== 'function')
      return;
    const resize = new win.ResizeObserver(() => controller.recalculateHeight(true));
    const mutation = new win.MutationObserver(() => controller.recalculateHeight(true));
    resize.observe(node);
    mutation.observe(node, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      const disposeHost = attach(host);
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          disposeHost?.();
        });
    });
  }
  const mergedProps = $derived.by(() => {
    const { class: className, style, ...attributes } = props;
    return {
      ...mergeComponentProps(state, { class: className, style }, [internal, attributes], false),
      [hostAttachmentKey]: attachHost,
    };
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
