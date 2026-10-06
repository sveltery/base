<script lang="ts">
  // Original NavigationMenuArrow refs/styles/state and canonical renderer (MIT).
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { useNavigationMenuPositionerContext } from './positioner/NavigationMenuPositionerContext.js';
  import { useNavigationMenuRootContext } from './root/NavigationMenuRootContext.js';
  import { popupStateMapping } from '../utils/popupStateMapping.js';
  import { getDisabledMountTransitionStyles } from '../internals/getDisabledMountTransitionStyles.js';
  import type { NavigationMenuArrowProps } from './types.js';
  let {
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    ...elementProps
  }: NavigationMenuArrowProps = $props();
  const root = useNavigationMenuRootContext();
  const positioning = useNavigationMenuPositionerContext();
  const state = $derived({
    open: root.open,
    side: positioning.side,
    align: positioning.align,
    uncentered: positioning.arrowUncentered,
  });
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;

      positioning.arrowRef.current = host;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;

          if (positioning.arrowRef.current === host) positioning.arrowRef.current = null;
        });
    });
  }
  const params = $derived({
    state,
    props: [
      { style: positioning.arrowStyles, 'aria-hidden': true },
      getDisabledMountTransitionStyles(root.transitionStatus),
      elementProps,
    ],
    stateAttributesMapping: popupStateMapping,
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
