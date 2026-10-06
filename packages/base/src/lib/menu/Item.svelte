<script lang="ts">
  import { mergeComponentProps } from '../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { untrack } from 'svelte';

  // Original MenuItem/list/button/render composition (MIT).
  import { REGULAR_ITEM, useMenuItem } from './item/useMenuItem.svelte.js';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { useMenuPositionerContext } from './positioner/MenuPositionerContext.js';
  import { useCompositeListItem } from '../internals/composite/list/useCompositeListItem.svelte.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import type { MenuItemProps } from './types.js';
  let {
    render,
    class: className,
    id: idProp,
    label,
    nativeButton = false,
    disabled: disabledProp = false,
    closeOnClick = true,
    style,
    children,
    ref = $bindable(null),
    ...elementProps
  }: MenuItemProps = $props();
  const generatedId = $props.id();
  const listItem = useCompositeListItem(() => ({ guess: true, label }));
  const positioner = useMenuPositionerContext(true);
  const id = $derived(useBaseUiId(idProp, generatedId));
  const { store } = useMenuRootContext();
  const disabled = $derived(disabledProp || store.useState('disabled'));
  const highlighted = $derived(store.useState('isActive', listItem.index()));
  const itemProps = $derived(store.useState('itemProps'));
  const item = useMenuItem(() => ({
    closeOnClick,
    disabled,
    highlighted,
    id,
    store,
    nativeButton,
    nodeId: positioner?.context.nodeId,
    itemMetadata: REGULAR_ITEM,
  }));
  const state = $derived({ disabled, highlighted });

  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    const unregisterItem = listItem.attach(host);
    return untrack(() => {
      const disposeItem = item.attachItem(host);
      ref = host;
      return () =>
        untrack(() => {
          disposeItem();
          if (ref === host) ref = null;
          unregisterItem();
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      state,
      { class: className, style: style },
      [itemProps, elementProps, item.getItemProps],
      undefined,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, state, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
