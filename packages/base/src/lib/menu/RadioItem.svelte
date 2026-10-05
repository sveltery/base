<script lang="ts">
  // Original MenuRadioItem complete radio/item/consumer-order composition (MIT).
  import RenderElement from '../internals/RenderElement.svelte';
  import { NOOP } from '../utils/empty.js';
  import { useMenuRootContext } from './root/MenuRootContext.js';
  import { useBaseUiId } from '../internals/useBaseUiId.js';
  import { useMenuRadioGroupContext } from './radio-group/MenuRadioGroupContext.js';
  import { provideMenuRadioItemContext } from './radio-item/MenuRadioItemContext.js';
  import { itemMapping } from './utils/stateAttributesMapping.js';
  import { useCompositeListItem } from '../internals/composite/list/useCompositeListItem.svelte.js';
  import { REGULAR_ITEM, useMenuItem } from './item/useMenuItem.svelte.js';
  import { useMenuPositionerContext } from './positioner/MenuPositionerContext.js';
  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../internals/reasons.js';
  import type { MenuRadioItemProps } from './types.js';
  // eslint-disable-next-line no-useless-assignment -- Publishes native bindable host/action outputs to the owner.
  let {
    render,
    class: className,
    id: idProp,
    label,
    nativeButton = false,
    disabled: disabledProp = false,
    closeOnClick = false,
    value,
    style,
    children,
    ref = $bindable(null),
    ...elementProps
  }: MenuRadioItemProps = $props();
  const generatedId = $props.id();
  const listItem = useCompositeListItem(() => ({ guess: true, label }));
  const positioner = useMenuPositionerContext(true);
  const id = $derived(useBaseUiId(idProp, generatedId));
  const { store } = useMenuRootContext();
  const highlighted = $derived(store.useState('isActive', listItem.index()));
  const itemProps = $derived(store.useState('itemProps'));
  const group = useMenuRadioGroupContext();
  const disabled = $derived(disabledProp || group.disabled || store.useState('disabled'));
  const checked = $derived(group.value === value);
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
  provideMenuRadioItemContext({
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
    group.setValue(value, details);
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
      { role: 'menuitemradio', 'aria-checked': checked, onclick: handleClick },
      elementProps,
      item.getItemProps,
    ],
    ref: [item.itemRef, setRef, listItem.ref],
  }}
  {children}
/>
