<!-- eslint-disable @typescript-eslint/no-explicit-any -- Retain Original permissive generic default. -->
<script lang="ts" generics="Value = any">
  // Original NavigationMenuRoot/TreeContext business bodies, native Svelte state/provider/markup (MIT).
  import { onDestroy, untrack } from 'svelte';
  import { isHTMLElement } from '@floating-ui/utils/dom';
  import { ownerDocument } from '../utils/owner.js';
  import { useIsoLayoutEffect } from '../utils/useIsoLayoutEffect.svelte.js';
  import { activeElement, contains } from '../floating-ui/utils/element.js';
  import {
    useFloatingParentNodeId,
    provideFloatingTree,
    useFloatingNodeId,
  } from '../floating-ui/components/FloatingTree.svelte.js';
  import type { FloatingRootContext } from '../floating-ui/types.js';
  import RenderElement from '../internals/RenderElement.svelte';
  import { useTransitionStatus } from '../internals/useTransitionStatus.svelte.js';
  import { useOpenChangeComplete } from '../internals/useOpenChangeComplete.svelte.js';
  import { REASONS } from '../internals/reasons.js';
  import {
    provideNavigationMenuRootContext,
    useNavigationMenuRootContext,
    type NavigationMenuRootContext,
  } from './root/NavigationMenuRootContext.js';
  import { setSharedFixedSize } from './utils/setSharedFixedSize.js';
  import * as NavigationMenuPositionerCssVars from './positioner/NavigationMenuPositionerCssVars.js';
  import TreeContext from './root/TreeContext.svelte';
  import type {
    NavigationMenuRootProps,
    NavigationMenuRootActions,
    NavigationMenuRootChangeEventReason,
    NavigationMenuRootChangeEventDetails,
  } from './types.js';
  const absentActions = Symbol('absent actions');
  let {
    actions = $bindable(absentActions as unknown as NavigationMenuRootActions),
    // eslint-disable-next-line no-useless-assignment -- Native bind:ref publishes the host.
    ref = $bindable(null),
    defaultValue = null,
    value: valueParam,
    onValueChange,
    delay = 50,
    closeDelay = 50,
    orientation = 'horizontal',
    onOpenChangeComplete,
    render,
    class: classProp,
    style,
    children,
    ...elementProps
  }: NavigationMenuRootProps<Value> = $props();
  const nativeId = $props.id();
  const manualUnmount = untrack(
    () => actions !== (absentActions as unknown as NavigationMenuRootActions),
  );
  const nested = useFloatingParentNodeId() != null;
  const parentRootContext = useNavigationMenuRootContext<Value>(true);
  if (!nested) provideFloatingTree();
  const nodeId = useFloatingNodeId(`${nativeId}-node`);
  let uncontrolledValue = $state<Value | null>(untrack(() => defaultValue));
  const value = $derived(valueParam !== undefined ? valueParam : uncontrolledValue);
  const open = $derived(value != null);
  let closeReason = $state<NavigationMenuRootChangeEventReason | undefined>();
  let positionerElement = $state.raw<HTMLElement | null>(null);
  let popupElement = $state.raw<HTMLElement | null>(null);
  let viewportElement = $state.raw<HTMLElement | null>(null);
  let viewportTargetElement = $state.raw<HTMLElement | null>(null);
  let activationDirection = $state<NavigationMenuRootContext['activationDirection']>(null);
  let floatingRootContext = $state.raw<FloatingRootContext | undefined>();
  let viewportInert = $state(false);
  const rootRef = { current: null as HTMLElement | null };
  const prevTriggerElementRef = { current: undefined as Element | null | undefined };
  let currentContent = $state.raw<HTMLDivElement | null>(null);
  const currentContentRef = {
    get current() {
      return currentContent;
    },
    set current(node: HTMLDivElement | null) {
      currentContent = node;
    },
  };
  const beforeInsideRef = { current: null as HTMLSpanElement | null };
  const afterInsideRef = { current: null as HTMLSpanElement | null };
  const beforeOutsideRef = { current: null as HTMLSpanElement | null };
  const afterOutsideRef = { current: null as HTMLSpanElement | null };
  const popupAutoSizeResetRef = {
    current: { abortController: null as AbortController | null, owner: null as unknown },
  };
  const presence = useTransitionStatus(() => open);
  const blockedReturnFocusReasons = new Set<string>([
    REASONS.triggerHover,
    REASONS.outsidePress,
    REASONS.focusOut,
  ]);
  function getPositionerFixedSize(positioner: HTMLElement) {
    const width =
      parseFloat(
        positioner.style.getPropertyValue(NavigationMenuPositionerCssVars.positionerWidth),
      ) || 0;
    const height =
      parseFloat(
        positioner.style.getPropertyValue(NavigationMenuPositionerCssVars.positionerHeight),
      ) || 0;
    if (width <= 0 || height <= 0) return null;
    return { width, height };
  }
  useIsoLayoutEffect(
    () => {
      if (open || !positionerElement || !popupElement) return;
      const size = getPositionerFixedSize(positionerElement);
      if (size) setSharedFixedSize(popupElement, positionerElement, size.width, size.height);
    },
    () => [open, popupElement, positionerElement],
  );
  useIsoLayoutEffect(
    () => {
      viewportInert = false;
    },
    () => [value],
  );
  function setValue(nextValue: Value | null, eventDetails: NavigationMenuRootChangeEventDetails) {
    if (nextValue == null) closeReason = eventDetails.reason;
    if (nextValue !== value) onValueChange?.(nextValue, eventDetails);
    if (eventDetails.isCanceled) return;
    if (nextValue == null) {
      activationDirection = null;
      floatingRootContext = undefined;
    }
    if (valueParam === undefined) uncontrolledValue = nextValue;
    if (nested && nextValue == null && eventDetails.reason === REASONS.linkPress && parentRootContext)
      parentRootContext.setValue(null, eventDetails);
  }
  function handleUnmount() {
    const doc = ownerDocument(rootRef.current);
    const activeEl = activeElement(doc);
    const blocked = closeReason ? blockedReturnFocusReasons.has(closeReason) : false;
    if (
      !blocked &&
      isHTMLElement(prevTriggerElementRef.current) &&
      (activeEl === ownerDocument(popupElement).body || contains(popupElement, activeEl)) &&
      popupElement
    ) {
      prevTriggerElementRef.current.focus({ preventScroll: true });
      prevTriggerElementRef.current = undefined;
    }
    presence.setMounted(false);
    onOpenChangeComplete?.(false);
    activationDirection = null;
    floatingRootContext = undefined;
    currentContentRef.current = null;
    closeReason = undefined;
  }
  actions = { unmount: handleUnmount };
  onDestroy(() => {
    actions = null;
    popupAutoSizeResetRef.current.abortController?.abort();
  });
  useOpenChangeComplete({
    get enabled() {
      return !manualUnmount;
    },
    get open() {
      return open;
    },
    ref: {
      get current() {
        return popupElement;
      },
    },
    onComplete() {
      if (!open) handleUnmount();
    },
  });
  useOpenChangeComplete({
    get enabled() {
      return !manualUnmount;
    },
    get open() {
      return open;
    },
    ref: {
      get current() {
        return viewportTargetElement;
      },
    },
    onComplete() {
      if (!open) handleUnmount();
    },
  });
  const context: NavigationMenuRootContext<Value> = {
    get open() {
      return open;
    },
    get value() {
      return value;
    },
    setValue,
    get mounted() {
      return presence.mounted;
    },
    get transitionStatus() {
      return presence.transitionStatus;
    },
    get popupElement() {
      return popupElement;
    },
    setPopupElement(node) {
      popupElement = node;
    },
    get positionerElement() {
      return positionerElement;
    },
    setPositionerElement(node) {
      positionerElement = node;
    },
    get viewportElement() {
      return viewportElement;
    },
    setViewportElement(node) {
      viewportElement = node;
    },
    get viewportTargetElement() {
      return viewportTargetElement;
    },
    setViewportTargetElement(node) {
      viewportTargetElement = node;
    },
    get activationDirection() {
      return open ? activationDirection : null;
    },
    setActivationDirection(next) {
      activationDirection = next;
    },
    get floatingRootContext() {
      return floatingRootContext;
    },
    setFloatingRootContext(next) {
      floatingRootContext = next;
    },
    currentContentRef,
    nested,
    rootRef,
    beforeInsideRef,
    afterInsideRef,
    beforeOutsideRef,
    afterOutsideRef,
    prevTriggerElementRef,
    popupAutoSizeResetRef,
    get delay() {
      return delay;
    },
    get closeDelay() {
      return closeDelay;
    },
    get orientation() {
      return orientation;
    },
    get viewportInert() {
      return viewportInert;
    },
    setViewportInert(next) {
      viewportInert = next;
    },
  };
  provideNavigationMenuRootContext(context);
  const componentProps = $derived({ render, class: classProp, style });
  const partState = $derived({ open, nested });
  const refs = [
    (node: HTMLElement | null) => {
      ref = node;
      rootRef.current = node;
    },
  ];
  const params = $derived({ state: partState, ref: refs, props: elementProps });
</script>
<TreeContext {nodeId}>
  <RenderElement tag={nested ? 'div' : 'nav'} {componentProps} {params} {children} />
</TreeContext>
