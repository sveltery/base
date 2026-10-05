// Original Base UI 1.8.0 useFloatingPortalNode, canonical native host boundary.
// MIT: THIRD_PARTY_NOTICES.md; pin 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// Host/container/id/content bodies extracted from approved public FullPortal
// SHA256 56ef7993c9378f0710f7724a40280f8ba31fa7fb515b218802d7935c3a95f75b.
import { getAllContexts, mount, unmount, untrack, type Snippet } from 'svelte';
import { getWindow, isNode } from '@floating-ui/utils/dom';

import type { MergedRef } from '@sveltery/utils/useMergedRefs';
import type { HTMLProps } from '../../internals/types.js';
import type { UseRenderElementComponentProps } from '../../internals/useRenderElement.js';
import RenderElement from '../../internals/RenderElement.svelte';
import PortalContent from '../components/PortalContent.svelte';
import { createAttribute } from '../utils/createAttribute.js';
import { usePortalContext } from '../components/FloatingPortalContext.js';

export type PortalContainer =
  | HTMLElement
  | ShadowRoot
  | { current: HTMLElement | ShadowRoot | null }
  | null;

export interface UseFloatingPortalNodeProps<State extends object> {
  ref?: MergedRef<HTMLElement> | undefined;
  container?: PortalContainer | undefined;
  componentProps?: UseRenderElementComponentProps<State> | undefined;
  elementProps?: HTMLProps | undefined;
}

export interface UseFloatingPortalNodeResult {
  readonly node: HTMLElement | null;
  readonly nodeId: string | undefined;
}

export function useFloatingPortalNode<State extends object = Record<string, never>>(
  getProps: () => UseFloatingPortalNodeProps<State>,
  generatedId: string,
): UseFloatingPortalNodeResult {
  const { ref, container, componentProps = {}, elementProps } = $derived(getProps());
  const uniqueId = generatedId;
  const attr = createAttribute('portal');
  const parentPortal = usePortalContext();
  // The actual host is outside a FullPortal's own provider. Capture before it.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity -- Immutable native context snapshot for a separately mounted host; no reactive Map ownership is needed.
  const hostContext = new Map(getAllContexts());
  let containerElement = $state.raw<HTMLElement | ShadowRoot | null>(null);
  let portalNode = $state.raw<HTMLElement | null>(null);
  let portalNodeId = $state<string | undefined>();
  let containerRef: HTMLElement | ShadowRoot | null = null;
  $effect(() => {
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
  });
  function portalRef(node: HTMLElement | null) {
    portalNode = node;
    if (!node) { portalNodeId = undefined; return; }
    // Opaque Svelte snippets own their native element/id. Observe the actual host, including replacement ids.
    const updateId = () => { portalNodeId = node.id || undefined; };
    updateId();
    const observer = new (getWindow(node).MutationObserver)(updateId);
    observer.observe(node, { attributes: true, attributeFilter: ['id'] });
    return () => { observer.disconnect(); if (portalNode === node) { portalNode = null; portalNodeId = undefined; } };
  }
  // One native host mount replaces Original's shared node createPortal.
  $effect(() => {
    const target = containerElement;
    if (!target) return;
    const instance = untrack(() => mount(RenderElement<State, HTMLElement>, {
      target, context: hostContext,
      props: {
        tag: 'div',
        get componentProps() { return componentProps; },
        get params() { return { ref: [ref, portalRef], props: [{ id: uniqueId, [attr]: '' }, elementProps] }; },
      },
    }));
    return () => { void unmount(instance); };
  });
  return {
    get node() { return portalNode; },
    get nodeId() { return portalNodeId; },
  };
}

/** One native child mount replaces Full/Lite's child createPortal. */
export function useFloatingPortalContent(
  getNode: () => HTMLElement | null,
  getChildren: () => Snippet | undefined,
  childrenContext: Map<unknown, unknown>,
) {
  $effect(() => {
    const target = getNode();
    if (!target) return;
    const instance = untrack(() => mount(PortalContent, {
      target, context: childrenContext, props: { get children() { return getChildren(); } },
    }));
    return () => { void unmount(instance); };
  });
}
