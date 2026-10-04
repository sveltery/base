<script lang="ts">
  // Original MenuItem/list/button/render composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { REGULAR_ITEM, useMenuItem } from './item/useMenuItem.svelte.js';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { useMenuPositionerContext } from './positioner/MenuPositionerContext.js';
  import { useCompositeListItem } from '../internals/composite/list/useCompositeListItem.svelte.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import type { MenuItemProps } from './types.js';
  let { render, class: className, id: idProp, label, nativeButton = false, disabled: disabledProp = false, closeOnClick = true, style, children, ref = $bindable(null), ...elementProps }: MenuItemProps = $props();
  const generatedId = $props.id();
  const listItem = useCompositeListItem(() => ({ guess: true, label }));
  const positioner = useMenuPositionerContext(true);
  const id = $derived(useBaseUiId(idProp, generatedId));
  const { store } = useMenuRootContext();
  const disabled = $derived(disabledProp || store.useState('disabled'));
  const highlighted = $derived(store.useState('isActive', listItem.index()));
  const itemProps = $derived(store.useState('itemProps'));
  const item = useMenuItem(() => ({ closeOnClick, disabled, highlighted, id, store, nativeButton, nodeId: positioner?.context.nodeId, itemMetadata: REGULAR_ITEM }));
  const state = $derived({ disabled, highlighted });
  const setRef = (node: HTMLElement | null) => { ref = node; };
</script>
<RenderElement tag="div" componentProps={{ render, class: className, style }} params={{ state, props: [itemProps, elementProps, item.getItemProps], ref: [item.itemRef, setRef, listItem.ref] }} {children} />
