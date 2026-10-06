<script lang="ts">
  import { untrack } from 'svelte';
  // Source business body: Base UI v1.8.0 TabsTab.tsx at 47b40521. MIT.
  import { ownerDocument } from '@sveltery/utils/owner';
  import { useId } from '@sveltery/utils/useId';
  import { activeElement, contains } from '@sveltery/utils/shadowDom';

  import { useButton } from '../../internals/use-button/useButton.svelte.js';
  import { useCompositeItem } from '../../internals/composite/item/useCompositeItem.svelte.js';
  import { useCompositeRootContext } from '../../internals/composite/root/CompositeRootContext.js';
  import { ACTIVE_COMPOSITE_ITEM } from '../../internals/composite/constants.js';
  import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../internals/reasons.js';
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
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
  const nativeId = $props.id();
  const id = $derived(useId(idProp ?? undefined, 'base-ui', nativeId));
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
  $effect(() => {
    const isActive = active;
    const index = composite.index();
    const highlightedIndex = compositeRoot.highlightedIndex;
    const isDisabled = disabled;
    const listElement = list.tabsListElement;
    if (isNavigatingRef.current) {
      isNavigatingRef.current = false;
      return;
    }
    if (!(isActive && index > -1 && highlightedIndex !== index)) return;
    if (listElement != null) {
      const activeEl = activeElement(ownerDocument(listElement));
      if (activeEl && contains(listElement, activeEl)) return;
    }
    if (!isDisabled) untrack(() => compositeRoot.onHighlightedIndexChange(index));
  });
  const button = useButton(() => ({
    disabled,
    native: nativeButton,
    focusableWhenDisabled: true,
  }));
  const { getButtonProps, buttonRef } = button;
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
    if (list.activateOnFocus && (!isPressingRef.current || isMainButtonRef.current))
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
  const hostAttachmentKey = createAttachmentKey();
  function attachHost(host: HTMLElement) {
    return untrack(() => {
      ref = host;
      buttonRef?.(host);
      observeTabElement(host);
      const unobserve = unobserveTabElementRef.current;
      return () =>
        untrack(() => {
          if (ref === host) ref = null;
          if (button.element === host) buttonRef(null);
          unobserve?.();
          if (unobserveTabElementRef.current === unobserve) unobserveTabElementRef.current = null;
        });
    });
  }
  const mergedProps = $derived({
    ...mergeComponentProps(
      partState,
      { class: classProp, style },
      [
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
      tabsStateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
</script>

{#if render}
  {@render render(mergedProps, partState, children)}
{:else}
  <button type="button" {...mergedProps}>{@render children?.()}</button>
{/if}
