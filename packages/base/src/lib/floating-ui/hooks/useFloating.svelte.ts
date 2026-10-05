// Original Base UI 1.8.0 useFloatingWithStore/useBaseUIFloating at
// 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.
// Native Svelte store/host lifetime delegates to the single default-platform DOM geometry driver.
import { isElement } from '@floating-ui/utils/dom';
import { useIsoLayoutEffect } from '../../utils/useIsoLayoutEffect.svelte.js';
import { useFloating as usePosition, type NativeFloatingOptions } from '../../internals/anchor-positioning/useFloating.svelte.js';
import { useFloatingTree } from '../components/FloatingTree.svelte.js';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import type { FloatingTreeStore } from '../components/FloatingTreeStore.js';
import type { PositionedFloatingContext, ReferenceType } from '../types.js';

export interface BaseUIFloatingOptions extends NativeFloatingOptions {
  rootContext: FloatingRootStore;
  nodeId?: string | undefined;
  externalTree?: FloatingTreeStore | undefined;
}

/** Original private path requires the root store; no unconsumed public hook API is invented. */
export function useBaseUIFloating(getOptions: () => BaseUIFloatingOptions) {
  return useFloatingWithStore(getOptions);
}

function useFloatingWithStore(getOptions: () => BaseUIFloatingOptions) {
  const options = $derived(getOptions());
  const store = $derived(options.rootContext);
  const referenceElement = $derived(store.useState('referenceElement'));
  const floatingElement = $derived(store.useState('floatingElement'));
  const domReferenceElement = $derived(store.useState('domReferenceElement'));
  const open = $derived(store.useState('open'));
  const floatingId = $derived(store.useState('floatingId'));
  let positionReference = $state.raw<ReferenceType | null>(null);
  let localDomReference = $state.raw<Element | null | undefined>(undefined);
  let localFloatingElement = $state.raw<HTMLElement | null | undefined>(undefined);
  const domReferenceRef = { current: null as Element | null };
  // Context discovery happens during native component initialization.
  const contextTree = useFloatingTree();
  const tree = $derived(options.externalTree ?? contextTree);

  const position = usePosition(() => ({
    ...options,
    elements: {
      reference: positionReference || referenceElement,
      floating: floatingElement,
    },
  }));
  const localDomReferenceElement = $derived(isElement(localDomReference) ? localDomReference : null);
  const syncedFloatingElement = $derived(localFloatingElement === undefined ? floatingElement : localFloatingElement);
  useIsoLayoutEffect(() => {
    store.update({
      referenceElement: localDomReference ?? null,
      domReferenceElement: localDomReference === undefined ? domReferenceElement : localDomReferenceElement,
      floatingElement: syncedFloatingElement,
    });
  }, () => [store, localDomReference, domReferenceElement, localDomReferenceElement, syncedFloatingElement]);

  function setPositionReference(node: ReferenceType | null) {
    const computedPositionReference = isElement(node)
      ? { getBoundingClientRect: () => node.getBoundingClientRect(), getClientRects: () => node.getClientRects(), contextElement: node }
      : node;
    positionReference = computedPositionReference;
    position.refs.setReference(computedPositionReference);
  }
  function setReference(node: ReferenceType | null) {
    if (isElement(node) || node === null) {
      domReferenceRef.current = node;
      localDomReference = node;
    }
    if (isElement(position.refs.reference.current) || position.refs.reference.current === null || (node !== null && !isElement(node))) {
      position.refs.setReference(node);
    }
  }
  function setFloating(node: HTMLElement | null) {
    localFloatingElement = node;
    position.refs.setFloating(node);
  }
  const refs = {
    domReference: domReferenceRef,
    reference: position.refs.reference,
    floating: position.refs.floating,
    setReference, setPositionReference, setFloating,
  };
  const elements = {
    get reference() { return position.elements.reference; },
    get floating() { return position.elements.floating; },
    get domReference() { return domReferenceElement; },
  };
  const context: PositionedFloatingContext = {
    get x() { return position.data.x; }, get y() { return position.data.y; },
    get placement() { return position.data.placement; }, get strategy() { return position.data.strategy; },
    get middlewareData() { return position.data.middlewareData; }, get isPositioned() { return position.data.isPositioned; },
    get floatingStyles() { return position.floatingStyles; }, update: position.update,
    get dataRef() { return store.context.dataRef; }, get open() { return open; },
    onOpenChange(nextOpen, details) { store.setOpen(nextOpen, details); },
    get events() { return store.context.events; }, get floatingId() { return floatingId; },
    refs, elements, get nodeId() { return options.nodeId; }, get rootStore() { return store; },
  };
  useIsoLayoutEffect(() => {
    if (domReferenceElement) domReferenceRef.current = domReferenceElement;
  }, () => [domReferenceElement]);
  useIsoLayoutEffect(() => {
    const dataRef = store.context.dataRef;
    dataRef.current.floatingContext = context;
    const node = tree?.nodesRef.current.find(entry => entry.id === options.nodeId);
    if (node) node.context = context;
    // Native derived getters belong to this positioner's lifetime. The root/tree
    // outlive a closed popup, so release only this publication during teardown.
    return () => {
      if (dataRef.current.floatingContext === context) delete dataRef.current.floatingContext;
      if (node?.context === context) node.context = undefined;
    };
  });

  return {
    get elements() { return elements; }, get data() { return position.data; },
    get error() { return position.error; }, get floatingStyles() { return position.floatingStyles; },
    refs, update: position.update, context, get rootStore() { return store; },
  };
}
