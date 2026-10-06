<script lang="ts">
  // Original NavigationMenuPopup state, physical-origin pinning and canonical renderer (MIT).
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  import { useNavigationMenuRootContext } from './root/NavigationMenuRootContext.js';
  import { useNavigationMenuPositionerContext } from './positioner/NavigationMenuPositionerContext.js';
  import { useDirection } from '../direction-provider/context.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { popupTransitionStateMapping } from '../utils/popupStateMapping.js';
  import { getDisabledMountTransitionStyles } from '../internals/getDisabledMountTransitionStyles.js';
  import type { NavigationMenuPopupProps } from './types.js';
  let {
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    id: idProp,
    ...elementProps
  }: NavigationMenuPopupProps = $props();
  const nativeId = $props.id();
  const id = $derived(useBaseUiId(idProp ?? undefined, nativeId));
  const root = useNavigationMenuRootContext();
  const positioning = useNavigationMenuPositionerContext();
  const direction = useDirection();
  const state = $derived({
    open: root.open,
    transitionStatus: root.transitionStatus,
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
  });
  const isPhysicalLeft = $derived(
    positioning.side === 'left' ||
      positioning.side === (direction() === 'rtl' ? 'inline-end' : 'inline-start'),
  );
  const isOriginSide = $derived(positioning.side === 'top' || isPhysicalLeft);
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      root.setPopupElement(host);

      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (root.popupElement === host) root.setPopupElement(null);
        });
    });
  }
  const params = $derived({
    state,
    props: [
      {
        id,
        tabindex: -1,
        style: {
          ...(isOriginSide
            ? {
                position: 'absolute',
                [positioning.side === 'top' ? 'bottom' : 'top']: '0',
                [isPhysicalLeft ? 'right' : 'left']: '0',
              }
            : {}),
        },
      },
      getDisabledMountTransitionStyles(root.transitionStatus),
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

{#if render}{@render render(mergedProps, state, children)}{:else}<nav {...mergedProps}
    >{@render children?.()}</nav
  >{/if}
