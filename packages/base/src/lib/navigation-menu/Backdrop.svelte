<script lang="ts">
  // Original NavigationMenuBackdrop state/hidden/user-selection branches (MIT).
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { useNavigationMenuRootContext } from './root/NavigationMenuRootContext.js';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import type { NavigationMenuBackdropProps } from './types.js';
  let {
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    ...elementProps
  }: NavigationMenuBackdropProps = $props();
  const root = useNavigationMenuRootContext();
  const state = $derived({ open: root.open, transitionStatus: root.transitionStatus });
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;

      return () =>
        untrack(() => {
          if (ref === host) ref = null;
        });
    });
  }
  const params = $derived({
    state,
    props: [
      {
        role: 'presentation',
        hidden: !root.mounted,
        style: { userSelect: 'none', WebkitUserSelect: 'none' },
      },
      elementProps,
    ],
    stateAttributesMapping: popupTransitionStateMapping,
  });
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: classProp, style },
      params.props,
      params.stateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}{@render render(mergedProps, state, children)}{:else}<div {...mergedProps}
    >{@render children?.()}</div
  >{/if}
