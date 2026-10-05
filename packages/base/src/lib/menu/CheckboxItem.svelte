<script lang="ts">
  import { untrack } from 'svelte';
  // Original MenuCheckboxItem complete controlled/cancelable item composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { Controlled } from '@sveltery/utils/Controlled';
  import { NOOP } from '@sveltery/utils/empty';
  import { provideMenuCheckboxItemContext } from './checkbox-item/MenuCheckboxItemContext.js';
  import { REGULAR_ITEM, useMenuItem } from './item/useMenuItem.svelte.js';
  import { useCompositeListItem } from '../internals/composite/list/useCompositeListItem.svelte.js';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { itemMapping } from './utils/stateAttributesMapping.js';
  import { useMenuPositionerContext } from './positioner/MenuPositionerContext.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import type { MenuCheckboxItemProps } from './types.js';
  let {
    render,
    class: className,
    id: idProp,
    label,
    nativeButton = false,
    disabled: disabledProp = false,
    closeOnClick = false,
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    style,
    children,
    // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
    ref = $bindable(null),
    ...elementProps
  }: MenuCheckboxItemProps = $props();
  const generatedId = $props.id();
  const listItem = useCompositeListItem(() => ({ guess: true, label }));
  const positioner = useMenuPositionerContext(true);
  const id = $derived(useBaseUiId(idProp, generatedId));
  const { store } = useMenuRootContext();
  const disabled = $derived(disabledProp || store.useState('disabled'));
  const highlighted = $derived(store.useState('isActive', listItem.index()));
  const itemProps = $derived(store.useState('itemProps'));
  const checkedState = new Controlled(
    () => checkedProp,
    untrack(() => defaultChecked ?? false),
  );
  const checked = $derived(checkedState.value);
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
  const componentState = $derived({ disabled, highlighted, checked });
  provideMenuCheckboxItemContext({
    get disabled() {
      return disabled;
    },
    get highlighted() {
      return highlighted;
    },
    get checked() {
      return checked;
    },
  });
  function handleClick(event: MouseEvent) {
    const details = createChangeEventDetails(REASONS.itemPress, event, undefined, {
      preventUnmountOnClose: NOOP,
    });
    onCheckedChange?.(!checked, details);
    if (details.isCanceled) return;
    checkedState.set(!checkedState.value);
  }
  const setRef = (node: HTMLElement | null) => {
    ref = node;
  };
</script>

<RenderElement
  tag="div"
  componentProps={{ render, class: className, style }}
  params={{
    state: componentState,
    stateAttributesMapping: itemMapping,
    props: [
      itemProps,
      { role: 'menuitemcheckbox', 'aria-checked': checked, onclick: handleClick },
      elementProps,
      item.getItemProps,
    ],
    ref: [item.itemRef, setRef, listItem.ref],
  }}
  {children}
/>
