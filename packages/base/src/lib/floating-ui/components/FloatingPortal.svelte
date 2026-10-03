<script lang="ts">
  // Base UI v1.8.0 FloatingPortal/useFloatingPortalNode business composition, native DOM relocation boundary.
  // MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
  import { getAllContexts, mount, unmount, untrack, setContext, type Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { isNode } from '@floating-ui/utils/dom';
  import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
  import { addEventListener } from '../../utils/addEventListener.js';
  import { mergeCleanups } from '../../utils/mergeCleanups.js';
  import type { MergedRef } from '../../utils/useMergedRefs.js';
  import FocusGuard from '../../utils/FocusGuard.svelte';
  import RenderElement from '../../internals/RenderElement.svelte';
  import PortalContent from './PortalContent.svelte';
  import type { BaseUIComponentProps, WithBaseUIEvent } from '../../internals/types.js';
  import { toNativeStyle } from '../../internals/nativeProps.js';
  import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails.js';
  import { REASONS } from '../../internals/reasons.js';
  import { ownerVisuallyHidden } from '../../internals/constants.js';
  import { createAttribute } from '../utils/createAttribute.js';
  import { enableFocusInside, disableFocusInside, getPreviousTabbable, getNextTabbable, isOutsideEvent } from '../utils/tabbable.js';
  import { PORTAL, usePortalContext, type FocusManagerState, type FloatingPortalContext } from './FloatingPortalContext.js';
  let { children, container, ref, portalOwnerRole, ...componentProps }: Omit<WithBaseUIEvent<HTMLAttributes<HTMLElement>>, 'children' | 'class' | 'style'> & BaseUIComponentProps<Record<string, never>> & {
    children?: Snippet; container?: HTMLElement | ShadowRoot | { current: HTMLElement | ShadowRoot | null } | null;
    ref?: MergedRef<HTMLElement>; portalOwnerRole?: HTMLAttributes<HTMLSpanElement>['role'];
  } = $props();
  const generatedId = $props.id();
  const uniqueId = generatedId;
  const attr = createAttribute('portal');
  const parentPortal = usePortalContext();
  // Immutable context snapshot: the source host subtree is outside this Portal's provider.
  const hostContext = new Map(getAllContexts());
  let containerElement = $state.raw<HTMLElement | ShadowRoot | null>(null);
  let portalNode = $state.raw<HTMLElement | null>(null);
  let portalNodeId = $state<string | undefined>();
  let containerRef: HTMLElement | ShadowRoot | null = null;
  const beforeOutsideRef: { current: HTMLSpanElement | null } = { current: null };
  const afterOutsideRef: { current: HTMLSpanElement | null } = { current: null };
  const beforeInsideRef: { current: HTMLSpanElement | null } = { current: null };
  const afterInsideRef: { current: HTMLSpanElement | null } = { current: null };
  let focusManagerState = $state.raw<FocusManagerState>(null);
  let focusInsideDisabled = false;
  const modal = $derived(focusManagerState?.modal);
  const open = $derived(focusManagerState?.open);
  const shouldRenderGuards = $derived(!!focusManagerState && !focusManagerState.modal && focusManagerState.open && !!portalNode);
  const elementProps = $derived.by(() => { const { class: _class, style: _style, render: _render, ...rest } = componentProps; void _class; void _style; void _render; return rest; });
  useIsoLayoutEffect(() => {
    if (container === null) {
      if (containerRef) { containerRef = null; portalNode = null; containerElement = null; }
      return;
    }
    const resolvedContainer = (container && (isNode(container) ? container : container.current)) ?? parentPortal?.portalNode ?? document.body;
    if (resolvedContainer == null) {
      if (containerRef) { containerRef = null; portalNode = null; containerElement = null; }
      return;
    }
    if (containerRef !== resolvedContainer) { containerRef = resolvedContainer; portalNode = null; containerElement = resolvedContainer; }
  }, () => [container, parentPortal?.portalNode]);
  function portalRef(node: HTMLElement | null) {
    portalNode = node;
    if (!node) { portalNodeId = undefined; return; }
    // Opaque Svelte snippets own their native element/id. Observe the actual host, including replacement ids.
    const updateId = () => { portalNodeId = node.id || undefined; };
    updateId();
    const observer = new (node.ownerDocument.defaultView!.MutationObserver)(updateId);
    observer.observe(node, { attributes: true, attributeFilter: ['id'] });
    return () => { observer.disconnect(); if (portalNode === node) { portalNode = null; portalNodeId = undefined; } };
  }
  $effect(() => {
    const node = portalNode;
    if (!node || modal) return;
    function onFocus(event: FocusEvent) {
      if (node && event.relatedTarget && isOutsideEvent(event)) {
        if (event.type === 'focusin') {
          if (focusInsideDisabled) { enableFocusInside(node); focusInsideDisabled = false; }
        } else { disableFocusInside(node); focusInsideDisabled = true; }
      }
    }
    return mergeCleanups(addEventListener(node, 'focusin', onFocus, true), addEventListener(node, 'focusout', onFocus, true));
  });
  useIsoLayoutEffect(() => {
    if (!portalNode || open !== true || !focusInsideDisabled) return;
    enableFocusInside(portalNode); focusInsideDisabled = false;
  }, () => [open, portalNode]);
  const portalContext: FloatingPortalContext = {
    beforeOutsideRef, afterOutsideRef, beforeInsideRef, afterInsideRef,
    get portalNode() { return portalNode; },
    setFocusManagerState(value) { focusManagerState = value; },
  };
  setContext(PORTAL, portalContext);
  const childrenContext = getAllContexts();
  // Native replacement for the source's two createPortal calls. The complete
  // render subtree belongs in the container; children belong in its actual host.
  $effect(() => {
    const target = containerElement;
    if (!target) return;
    const instance = untrack(() => mount(RenderElement<Record<string, never>, HTMLElement>, {
      target, context: hostContext,
      props: {
        tag: 'div',
        get componentProps() { return componentProps; },
        get params() { return { ref: [ref, portalRef], props: [{ id: uniqueId, [attr]: '' }, elementProps] }; },
      },
    }));
    return () => { void unmount(instance); };
  });
  $effect(() => {
    const target = portalNode;
    if (!target) return;
    const instance = untrack(() => mount(PortalContent, {
      target, context: childrenContext, props: { get children() { return children; } },
    }));
    return () => { void unmount(instance); };
  });
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
      if (focusManagerState?.closeOnFocusOut) focusManagerState.onOpenChange(false, createChangeEventDetails(REASONS.focusOut, event));
    }
  }
</script>
{#if shouldRenderGuards}<FocusGuard data-type="outside" ref={beforeOutsideRef} onfocus={beforeOutsideFocus}/><span role={portalOwnerRole} aria-owns={portalNodeId} style={toNativeStyle(ownerVisuallyHidden)}></span>{/if}
{#if shouldRenderGuards}<FocusGuard data-type="outside" ref={afterOutsideRef} onfocus={afterOutsideFocus}/>{/if}
