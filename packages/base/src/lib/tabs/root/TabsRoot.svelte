<script lang="ts">
  // Source business body: Base UI v1.8.0 TabsRoot.tsx at 47b40521. MIT.
  import { untrack } from 'svelte';
  import { SvelteMap } from 'svelte/reactivity';
  import { Controlled } from '@sveltery/utils/Controlled';
  import { mergeComponentProps } from '../../internals/mergeComponentProps.js';
  import { createAttachmentKey } from 'svelte/attachments';
  import { createCompositeList } from '../../internals/composite/list/createCompositeList.svelte.js';
  import type { CompositeMetadata } from '../../internals/composite/list/CompositeListContext.js';
  import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../internals/reasons.js';
  import { setTabsRootContext } from './TabsRootContext.js';
  import { tabsStateAttributesMapping } from './stateAttributesMapping.js';
  import type {
    TabsRootProps,
    TabsRootState,
    TabsTabMetadata,
    TabsTabValue,
    TabsTabActivationDirection,
    TabsRootChangeEventDetails,
    TabsRootChangeEventReason,
  } from '../types.js';
  let {
    class: classProp,
    defaultValue: defaultValueAuthored,
    onValueChange: onValueChangeProp,
    orientation = 'horizontal',
    render,
    value: valueProp,
    style,
    ref = $bindable(),
    children,
    ...elementProps
  }: TabsRootProps = $props();
  const defaultValueProp = $derived(defaultValueAuthored === undefined ? 0 : defaultValueAuthored);
  const hasExplicitDefault = untrack(() => defaultValueAuthored !== undefined);
  const tabPanelRefs = { current: [] as Array<HTMLElement | null> };
  let mountedTabPanels = $state.raw(new Map<TabsTabValue, string>());
  const valueState = new Controlled<TabsTabValue>(
    () => valueProp,
    untrack(() => defaultValueProp),
  );
  const value = () => valueState.value;
  const setValue = (next: TabsTabValue) => valueState.set(next);
  const isControlled = $derived(valueProp !== undefined);
  let tabMap = $state.raw(new Map<Element, CompositeMetadata & Partial<TabsTabMetadata>>());
  const lastKnownTabElementRef = { current: undefined as Element | undefined };
  const getTabElementBySelectedValue = (selectedValue: TabsTabValue) =>
    findTabElement(tabMap, selectedValue);
  let activationDirectionState = $state.raw(
    untrack(() => ({
      previousValue: value(),
      tabActivationDirection: 'none' as TabsTabActivationDirection,
    })),
  );
  const activationDirection = $derived.by(() => {
    const { previousValue, tabActivationDirection: committedTabActivationDirection } =
      activationDirectionState;
    let tabActivationDirection = committedTabActivationDirection;
    let directionComputationIncomplete = false;
    if (previousValue !== value()) {
      tabActivationDirection = computeActivationDirection(
        previousValue,
        value(),
        orientation,
        tabMap,
      );
      directionComputationIncomplete =
        previousValue != null && value() != null && getTabElementBySelectedValue(value()) == null;
    }
    const nextPreviousValue = directionComputationIncomplete ? previousValue : value();
    const shouldSyncActivationDirectionState =
      previousValue !== nextPreviousValue ||
      committedTabActivationDirection !== tabActivationDirection;
    return {
      tabActivationDirection,
      nextPreviousValue,
      shouldSyncActivationDirectionState,
    };
  });
  $effect(() => {
    const { nextPreviousValue, tabActivationDirection, shouldSyncActivationDirectionState } =
      activationDirection;
    if (!shouldSyncActivationDirectionState) return;
    activationDirectionState = {
      previousValue: nextPreviousValue,
      tabActivationDirection,
    };
  });
  function onValueChange(newValue: TabsTabValue, eventDetails: TabsRootChangeEventDetails) {
    eventDetails.activationDirection = computeActivationDirection(
      value(),
      newValue,
      orientation,
      tabMap,
    );
    onValueChangeProp?.(newValue, eventDetails);
    if (eventDetails.isCanceled) return;
    setValue(newValue);
  }
  function notifyAutomaticValueChange(nextValue: TabsTabValue, reason: TabsRootChangeEventReason) {
    untrack(() =>
      onValueChangeProp?.(
        nextValue,
        createChangeEventDetails(reason, undefined, undefined, {
          activationDirection: 'none',
        }),
      ),
    );
  }
  function registerMountedTabPanel(panelValue: TabsTabValue, panelId: string) {
    const next = new SvelteMap(mountedTabPanels);
    next.set(panelValue, panelId);
    mountedTabPanels = next;
    return () => {
      if (mountedTabPanels.get(panelValue) !== panelId) return;
      const next = new SvelteMap(mountedTabPanels);
      next.delete(panelValue);
      mountedTabPanels = next;
    };
  }
  const getTabPanelIdByValue = (tabValue: TabsTabValue) => mountedTabPanels.get(tabValue);
  function getTabIdByPanelValue(panelValue: TabsTabValue) {
    for (const metadata of tabMap.values()) if (panelValue === metadata.value) return metadata.id;
    return undefined;
  }
  setTabsRootContext({
    getTabElementBySelectedValue,
    getTabIdByPanelValue,
    getTabPanelIdByValue,
    onValueChange,
    get orientation() {
      return orientation;
    },
    registerMountedTabPanel,
    setTabMap(map) {
      tabMap = map;
    },
    get tabActivationDirection() {
      return activationDirection.tabActivationDirection;
    },
    get value() {
      return value();
    },
  });
  const selectedTabMetadata = $derived.by(() => {
    for (const metadata of tabMap.values()) if (metadata.value === value()) return metadata;
    return undefined;
  });
  const firstEnabledTabValue = $derived.by(() => {
    for (const metadata of tabMap.values()) if (!metadata.disabled) return metadata.value;
    return undefined;
  });
  const shouldNotifyInitialValueChangeRef = { current: !hasExplicitDefault };
  const initialDefaultValueRef = { current: untrack(() => defaultValueProp) };
  const shouldHonorDisabledDefaultValueRef = { current: hasExplicitDefault };
  const didRegisterTabsRef = { current: false };
  $effect(() => {
    if (isControlled) return;
    function commitAutomaticValueChange(
      fallbackValue: TabsTabValue,
      fallbackReason: TabsRootChangeEventReason,
    ) {
      setValue(fallbackValue);
      activationDirectionState = {
        previousValue: fallbackValue,
        tabActivationDirection: 'none',
      };
      notifyAutomaticValueChange(fallbackValue, fallbackReason);
      shouldNotifyInitialValueChangeRef.current = false;
    }
    if (tabMap.size === 0) {
      if (
        didRegisterTabsRef.current &&
        value() !== null &&
        !lastKnownTabElementRef.current?.isConnected
      )
        commitAutomaticValueChange(null, REASONS.missing);
      return;
    }
    didRegisterTabsRef.current = true;
    lastKnownTabElementRef.current = tabMap.keys().next().value;
    const selectionIsDisabled = selectedTabMetadata?.disabled;
    const selectionIsMissing = selectedTabMetadata == null && value() !== null;
    if (!selectionIsDisabled && value() === initialDefaultValueRef.current)
      shouldHonorDisabledDefaultValueRef.current = false;
    if (
      shouldHonorDisabledDefaultValueRef.current &&
      selectionIsDisabled &&
      value() === initialDefaultValueRef.current
    )
      return;
    const shouldNotifyInitialValueChange = shouldNotifyInitialValueChangeRef.current;
    if (selectionIsDisabled || selectionIsMissing) {
      const fallbackValue = firstEnabledTabValue ?? null;
      if (value() === fallbackValue) {
        shouldNotifyInitialValueChangeRef.current = false;
        return;
      }
      let fallbackReason: TabsRootChangeEventReason = REASONS.missing;
      if (shouldNotifyInitialValueChange) fallbackReason = REASONS.initial;
      else if (selectionIsDisabled) fallbackReason = REASONS.disabled;
      commitAutomaticValueChange(fallbackValue, fallbackReason);
      return;
    }
    if (shouldNotifyInitialValueChange && selectedTabMetadata != null) {
      notifyAutomaticValueChange(value(), REASONS.initial);
      shouldNotifyInitialValueChangeRef.current = false;
    }
  });
  createCompositeList(() => ({ elementsRef: tabPanelRefs }));
  const partState: TabsRootState = $derived({
    orientation,
    tabActivationDirection: activationDirection.tabActivationDirection,
  });
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
  const mergedProps = $derived({
    ...mergeComponentProps(
      partState,
      { class: classProp, style },
      elementProps,
      tabsStateAttributesMapping,
    ),
    [hostAttachmentKey]: attachHost,
  });
  function findTabElement(
    map: Map<Element, CompositeMetadata & Partial<TabsTabMetadata>>,
    selected: TabsTabValue,
  ): HTMLElement | null {
    for (const [element, metadata] of map.entries())
      if (selected === metadata.value) return element as HTMLElement;
    return null;
  }
  function computeActivationDirection(
    oldValue: TabsTabValue,
    newValue: TabsTabValue,
    flow: 'horizontal' | 'vertical',
    map: Map<Element, CompositeMetadata & Partial<TabsTabMetadata>>,
  ): TabsTabActivationDirection {
    if (oldValue == null || newValue == null) return 'none';
    const [positionProp, backward, forward] =
      flow === 'horizontal'
        ? (['left', 'left', 'right'] as const)
        : (['top', 'up', 'down'] as const);
    const oldTab = findTabElement(map, oldValue),
      newTab = findTabElement(map, newValue);
    if (oldTab == null || newTab == null) {
      if (
        oldTab !== newTab &&
        (typeof oldValue === 'number' || typeof oldValue === 'string') &&
        typeof oldValue === typeof newValue
      )
        return newValue > oldValue ? forward : backward;
      return 'none';
    }
    const oldPosition = oldTab.getBoundingClientRect()[positionProp],
      newPosition = newTab.getBoundingClientRect()[positionProp];
    if (newPosition < oldPosition) return backward;
    if (newPosition > oldPosition) return forward;
    return 'none';
  }
</script>

{#if render}
  {@render render(mergedProps, partState, children)}
{:else}
  <div {...mergedProps}>{@render children?.()}</div>
{/if}
