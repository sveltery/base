<script lang="ts">
  import { untrack } from 'svelte';
  import { createAttachmentKey } from 'svelte/attachments';
  // Original NavigationMenuLink optional closure and tree/root containment (MIT).
  import CompositeItem from '../internals/composite/item/CompositeItem.svelte';
  import { useFloatingTree } from '../floating-ui/components/FloatingTree.svelte.js';
  import {
    useNavigationMenuRootContext,
    useNavigationMenuTreeContext,
  } from './root/NavigationMenuRootContext.js';
  import { isOutsideMenuEvent } from './utils/isOutsideMenuEvent.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import type { NavigationMenuLinkProps } from './types.js';
  let {
    ref = $bindable(null),
    render,
    class: classProp,
    style,
    children,
    active = false,
    closeOnClick = false,
    ...elementProps
  }: NavigationMenuLinkProps = $props();
  const root = useNavigationMenuRootContext();
  const nodeId = useNavigationMenuTreeContext();
  const tree = useFloatingTree();
  const state = $derived({ active });
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
  const hostProps = { [hostAttachmentKey]: attachHost };

  const defaultProps = $derived({
    'aria-current': active ? 'page' : undefined,
    tabindex: undefined,
    onclick(event: MouseEvent) {
      if (closeOnClick) root.setValue(null, createChangeEventDetails(REASONS.linkPress, event));
    },
    onfocusout(event: FocusEvent) {
      if (
        root.positionerElement &&
        root.popupElement &&
        isOutsideMenuEvent(
          {
            currentTarget: event.currentTarget as HTMLElement,
            relatedTarget: event.relatedTarget as HTMLElement | null,
          },
          { popupElement: root.popupElement, rootRef: root.rootRef, tree, nodeId },
        )
      )
        root.setValue(null, createChangeEventDetails(REASONS.focusOut, event));
    },
  });
</script>

<CompositeItem
  tag="a"
  {render}
  class={classProp}
  {style}
  {state}
  props={[defaultProps, elementProps, hostProps]}
  {children}
/>
