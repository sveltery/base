<script lang="ts">
  // Base UI v1.8.0 FloatingPortal/useFloatingPortalNode business composition, native DOM relocation boundary.
  // MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  import { getAllContexts, setContext, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { useIsoLayoutEffect } from '@sveltery/utils/useIsoLayoutEffect';
  import { addEventListener } from '@sveltery/utils/addEventListener';
  import { mergeCleanups } from '@sveltery/utils/mergeCleanups';
  import type { MergedRef } from '@sveltery/utils/useMergedRefs';
  import FocusGuard from '../../utils/FocusGuard.svelte';
  import {
    useFloatingPortalNode,
    useFloatingPortalContent,
  } from '../hooks/useFloatingPortalNode.svelte.js';
  import type { BaseUIComponentProps, WithBaseUIEvent } from '../../internals/types.js';
  import { toNativeStyle } from '../../internals/nativeProps.js';
  import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../internals/reasons.js';
  import { ownerVisuallyHidden } from '../../internals/constants.js';
  import {
    enableFocusInside,
    disableFocusInside,
    getPreviousTabbable,
    getNextTabbable,
    isOutsideEvent,
  } from '../utils/tabbable.js';
  import {
    PORTAL,
    type FocusManagerState,
    type FloatingPortalContext,
  } from './FloatingPortalContext.js';
  let {
    children,
    container,
    ref,
    portalOwnerRole,
    ...componentProps
  }: Omit<WithBaseUIEvent<HTMLAttributes<HTMLElement>>, 'children' | 'class' | 'style'> &
    BaseUIComponentProps<Record<string, never>> & {
      children?: Snippet;
      container?: HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null;
      ref?: MergedRef<HTMLElement>;
      portalOwnerRole?: HTMLAttributes<HTMLSpanElement>['role'];
    } = $props();
  const generatedId = $props.id();
  const portal = useFloatingPortalNode(
    () => ({ container, ref, componentProps, elementProps }),
    generatedId,
  );
  const portalNode = $derived(portal.node);
  const portalNodeId = $derived(portal.nodeId);
  const beforeOutsideRef: { current: HTMLSpanElement | null } = { current: null };
  const afterOutsideRef: { current: HTMLSpanElement | null } = { current: null };
  const beforeInsideRef: { current: HTMLSpanElement | null } = { current: null };
  const afterInsideRef: { current: HTMLSpanElement | null } = { current: null };
  let focusManagerState = $state.raw<FocusManagerState>(null);
  let focusInsideDisabled = false;
  const modal = $derived(focusManagerState?.modal);
  const open = $derived(focusManagerState?.open);
  const shouldRenderGuards = $derived(
    !!focusManagerState && !focusManagerState.modal && focusManagerState.open && !!portalNode,
  );
  const elementProps = $derived.by(() => {
    const { class: _class, style: _style, render: _render, ...rest } = componentProps;
    void _class;
    void _style;
    void _render;
    return rest;
  });
  $effect(() => {
    const node = portalNode;
    if (!node || modal) return;
    function onFocus(event: FocusEvent) {
      if (node && event.relatedTarget && isOutsideEvent(event)) {
        if (event.type === 'focusin') {
          if (focusInsideDisabled) {
            enableFocusInside(node);
            focusInsideDisabled = false;
          }
        } else {
          disableFocusInside(node);
          focusInsideDisabled = true;
        }
      }
    }
    return mergeCleanups(
      addEventListener(node, 'focusin', onFocus, true),
      addEventListener(node, 'focusout', onFocus, true),
    );
  });
  useIsoLayoutEffect(
    () => {
      if (!portalNode || open !== true || !focusInsideDisabled) return;
      enableFocusInside(portalNode);
      focusInsideDisabled = false;
    },
    () => [open, portalNode],
  );
  const portalContext: FloatingPortalContext = {
    beforeOutsideRef,
    afterOutsideRef,
    beforeInsideRef,
    afterInsideRef,
    get portalNode() {
      return portal.node;
    },
    setFocusManagerState(value) {
      focusManagerState = value;
    },
  };
  setContext(PORTAL, portalContext);
  const childrenContext = getAllContexts();
  useFloatingPortalContent(
    () => portalNode,
    () => children,
    childrenContext,
  );
  function beforeOutsideFocus(event: FocusEvent) {
    if (!portalNode) return;
    if (isOutsideEvent(event, portalNode)) beforeInsideRef.current?.focus();
    else getPreviousTabbable(focusManagerState?.domReference ?? null)?.focus();
  }
  function afterOutsideFocus(event: FocusEvent) {
    if (!portalNode) return;
    if (isOutsideEvent(event, portalNode)) afterInsideRef.current?.focus();
    else {
      getNextTabbable(focusManagerState?.domReference ?? null)?.focus();
      if (focusManagerState?.closeOnFocusOut)
        focusManagerState.onOpenChange(false, createChangeEventDetails(REASONS.focusOut, event));
    }
  }
</script>

<!-- Source onFocus supplies native focusin to the shared outside-guard business callbacks. -->
{#if shouldRenderGuards}<FocusGuard
    data-type="outside"
    ref={beforeOutsideRef}
    onfocusin={beforeOutsideFocus}
  /><span role={portalOwnerRole} aria-owns={portalNodeId} style={toNativeStyle(ownerVisuallyHidden)}
  ></span>{/if}
{#if shouldRenderGuards}<FocusGuard
    data-type="outside"
    ref={afterOutsideRef}
    onfocusin={afterOutsideFocus}
  />{/if}
