<script lang="ts">
  // Original MenuLinkItem link/button/common-item/composite-list composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useCompositeListItem } from '../internals/composite/list/useCompositeListItem.svelte.js';
  import { useMenuPositionerContext } from './positioner/MenuPositionerContext.js';
  import { useMenuItemCommonProps } from './item/useMenuItemCommonProps.svelte.js';
  import { REGULAR_ITEM } from './item/useMenuItem.svelte.js';
  import { useButton } from '../internals/use-button/useButton.svelte.js';
  import { mergeProps } from '../merge-props/index.js';
  import type { HTMLProps } from '../internals/types.js';
  import type { MenuLinkItemProps } from './types.js';
  let {
    render,
    class: className,
    id: idProp,
    label,
    closeOnClick = false,
    style,
    children,
    // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
    ref = $bindable(null),
    ...elementProps
  }: MenuLinkItemProps = $props();
  const generatedId = $props.id();
  const linkRef = { current: null as HTMLElement | null };
  const listItem = useCompositeListItem(() => ({ guess: true, label }));
  const positioner = useMenuPositionerContext(true);
  const id = $derived(useBaseUiId(idProp, generatedId));
  const { store } = useMenuRootContext();
  const highlighted = $derived(store.useState('isActive', listItem.index()));
  const itemProps = $derived(store.useState('itemProps'));
  const typingRef = store.context.typingRef;
  const { getButtonProps, buttonRef } = useButton(() => ({ native: false, composite: true }));
  const commonProps = useMenuItemCommonProps(() => ({
    closeOnClick,
    highlighted,
    id,
    nodeId: positioner?.context.nodeId,
    store,
    typingRef,
    itemRef: linkRef,
    itemMetadata: REGULAR_ITEM,
  }));
  function getItemProps(externalProps?: HTMLProps): HTMLProps {
    return mergeProps(commonProps(), externalProps, getButtonProps);
  }
  const componentState = $derived({ highlighted });
  const setRef = (node: HTMLElement | null) => {
    ref = node;
  };
</script>

<RenderElement
  tag="a"
  componentProps={{ render, class: className, style }}
  params={{
    state: componentState,
    props: [itemProps, elementProps, getItemProps],
    ref: [linkRef, buttonRef, setRef, listItem.ref],
  }}
  {children}
/>
