<script lang="ts">
  // Source business body: Base UI v1.8.0 TabsTab.tsx at 47b40521. MIT.
  import { ownerDocument } from '../../utils/owner.js';
  import { activeElement, contains } from '../../utils/shadowDom.js';
  import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
  import { useButton } from '../../internals/use-button/useButton.svelte.js';
  import { useCompositeItem } from '../../internals/composite/item/useCompositeItem.svelte.js';
  import { useCompositeRootContext } from '../../internals/composite/root/CompositeRootContext.js';
  import { ACTIVE_COMPOSITE_ITEM } from '../../internals/composite/constants.js';
  import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../internals/reasons.js';
  import RenderElement from '../../internals/RenderElement.svelte';
  import { useTabsRootContext } from '../root/TabsRootContext.js';
  import { useTabsListContext } from '../list/TabsListContext.js';
  import { tabsStateAttributesMapping } from '../root/stateAttributesMapping.js';
  import type { TabsTabProps, TabsTabState } from '../types.js';
  let {
    class: classProp,
    disabled = false,
    render,
    value,
    id: idProp,
    nativeButton = true,
    style,
    ref = $bindable(),
    children,
    ...elementProps
  }: TabsTabProps = $props();
  const root = useTabsRootContext(),
    list = useTabsListContext(),
    compositeRoot = useCompositeRootContext();
  const generatedId = $props.id();
  const id = $derived(idProp ?? generatedId);
  const tabMetadata = $derived({ disabled, id, value });
  const composite = useCompositeItem(() => ({ metadata: tabMetadata }));
  const active = $derived(value === root.value);
  const isNavigatingRef = { current: false };
  const unobserveTabElementRef = { current: null as (() => void) | null };
  function observeTabElement(element: HTMLElement | null) {
    unobserveTabElementRef.current?.();
    unobserveTabElementRef.current = element
      ? list.registerTabResizeObserverElement(element)
      : null;
  }
  useIsoLayoutEffect(
    () => {
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        return;
      }
      const index = composite.index();
      if (!(active && index > -1 && compositeRoot.highlightedIndex !== index))
        return;
      const listElement = list.tabsListElement;
      if (listElement != null) {
        const activeEl = activeElement(ownerDocument(listElement));
        if (activeEl && contains(listElement, activeEl)) return;
      }
      if (!disabled) compositeRoot.onHighlightedIndexChange(index);
    },
    () => [
      active,
      composite.index(),
      compositeRoot.highlightedIndex,
      disabled,
      list.tabsListElement,
    ],
  );
  const { getButtonProps, buttonRef } = useButton(() => ({
    disabled,
    native: nativeButton,
    focusableWhenDisabled: true,
  }));
  const tabPanelId = $derived(root.getTabPanelIdByValue(value));
  const isPressingRef = { current: false },
    isMainButtonRef = { current: false };
  function activate(event: Event) {
    root.onValueChange(
      value,
      createChangeEventDetails(REASONS.none, event, undefined, {
        activationDirection: 'none',
      }),
    );
  }
  function onClick(event: MouseEvent) {
    if (active || disabled) return;
    activate(event);
  }
  function onFocus(event: FocusEvent) {
    if (active || disabled) return;
    if (
      list.activateOnFocus &&
      (!isPressingRef.current || isMainButtonRef.current)
    )
      activate(event);
  }
  function onPointerDown(event: PointerEvent) {
    if (active || disabled) return;
    isPressingRef.current = true;
    isMainButtonRef.current = event.button === 0;
    const doc = ownerDocument(event.currentTarget as HTMLElement);
    function handlePointerEnd() {
      isPressingRef.current = false;
      isMainButtonRef.current = false;
      doc.removeEventListener('pointerup', handlePointerEnd);
      doc.removeEventListener('pointercancel', handlePointerEnd);
    }
    doc.addEventListener('pointerup', handlePointerEnd);
    doc.addEventListener('pointercancel', handlePointerEnd);
  }
  const partState: TabsTabState = $derived({
    disabled,
    active,
    orientation: root.orientation,
    tabActivationDirection: root.tabActivationDirection,
  });
  const forwardedRef = {
    get current() {
      return ref ?? null;
    },
    set current(element: HTMLElement | null) {
      ref = element;
    },
  };
  const componentProps = $derived({ render, class: classProp, style });
  const params = $derived({
    state: partState,
    ref: [forwardedRef, buttonRef, composite.compositeRef, observeTabElement],
    props: [
      composite.compositeProps,
      {
        role: 'tab',
        'aria-controls': tabPanelId,
        'aria-selected': active,
        id,
        onclick: onClick,
        onfocusin: onFocus,
        onpointerdown: onPointerDown,
        [ACTIVE_COMPOSITE_ITEM]: active ? '' : undefined,
        onkeydowncapture() {
          isNavigatingRef.current = true;
        },
      },
      elementProps,
      getButtonProps,
    ],
    stateAttributesMapping: tabsStateAttributesMapping,
  });
</script>
<RenderElement tag="button" {componentProps} {params} {children} />
