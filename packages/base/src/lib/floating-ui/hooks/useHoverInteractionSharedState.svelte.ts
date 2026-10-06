// Base UI 1.8.0 Original shared hover instance/pointer-mutation ownership. MIT: THIRD_PARTY_NOTICES.md.
import { onMount, untrack } from 'svelte';

import { Timeout } from '@sveltery/utils/useTimeout';

import type { ContextData, FloatingRootContext, SafePolygonOptions } from '../types.js';
import { isInteractiveElement } from '../utils/element.js';

export { isInteractiveElement };

export class HoverInteraction {
  pointerType: string | undefined;
  interactedInside: boolean;
  handler: ((event: MouseEvent) => void) | undefined;
  blockMouseMove: boolean;
  performedPointerEventsMutation: boolean;
  pointerEventsScopeElement: HTMLElement | SVGSVGElement | null;
  pointerEventsReferenceElement: HTMLElement | SVGSVGElement | null;
  pointerEventsFloatingElement: HTMLElement | null;
  restTimeoutPending: boolean;
  openChangeTimeout: Timeout;
  restTimeout: Timeout;
  handleCloseOptions: SafePolygonOptions | undefined;

  constructor() {
    this.pointerType = undefined;
    this.interactedInside = false;
    this.handler = undefined;
    this.blockMouseMove = true;
    this.performedPointerEventsMutation = false;
    this.pointerEventsScopeElement = null;
    this.pointerEventsReferenceElement = null;
    this.pointerEventsFloatingElement = null;
    this.restTimeoutPending = false;
    this.openChangeTimeout = new Timeout();
    this.restTimeout = new Timeout();
    this.handleCloseOptions = undefined;
  }

  static create(): HoverInteraction {
    return new HoverInteraction();
  }

  dispose = () => {
    this.openChangeTimeout.clear();
    this.restTimeout.clear();
  };

  disposeEffect = () => {
    return this.dispose;
  };
}

type PointerEventsMutationState = Pick<
  HoverInteraction,
  | 'performedPointerEventsMutation'
  | 'pointerEventsScopeElement'
  | 'pointerEventsReferenceElement'
  | 'pointerEventsFloatingElement'
>;

const pointerEventsMutationOwnerByScopeElement = new WeakMap<
  HTMLElement | SVGSVGElement,
  PointerEventsMutationState
>();

export function clearSafePolygonPointerEventsMutation(instance: PointerEventsMutationState) {
  if (!instance.performedPointerEventsMutation) {
    return;
  }

  const scopeElement = instance.pointerEventsScopeElement;

  if (scopeElement && pointerEventsMutationOwnerByScopeElement.get(scopeElement) === instance) {
    instance.pointerEventsScopeElement?.style.removeProperty('pointer-events');
    instance.pointerEventsReferenceElement?.style.removeProperty('pointer-events');
    instance.pointerEventsFloatingElement?.style.removeProperty('pointer-events');
    pointerEventsMutationOwnerByScopeElement.delete(scopeElement);
  }

  instance.performedPointerEventsMutation = false;
  instance.pointerEventsScopeElement = null;
  instance.pointerEventsReferenceElement = null;
  instance.pointerEventsFloatingElement = null;
}

export function applySafePolygonPointerEventsMutation(
  instance: PointerEventsMutationState,
  options: {
    scopeElement: HTMLElement | SVGSVGElement;
    referenceElement: HTMLElement | SVGSVGElement;
    floatingElement: HTMLElement;
  },
) {
  const { scopeElement, referenceElement, floatingElement } = options;

  const existingOwner = pointerEventsMutationOwnerByScopeElement.get(scopeElement);
  if (existingOwner && existingOwner !== instance) {
    clearSafePolygonPointerEventsMutation(existingOwner);
  }

  clearSafePolygonPointerEventsMutation(instance);
  instance.performedPointerEventsMutation = true;
  instance.pointerEventsScopeElement = scopeElement;
  instance.pointerEventsReferenceElement = referenceElement;
  instance.pointerEventsFloatingElement = floatingElement;
  pointerEventsMutationOwnerByScopeElement.set(scopeElement, instance);

  scopeElement.style.pointerEvents = 'none';
  referenceElement.style.pointerEvents = 'auto';
  floatingElement.style.pointerEvents = 'auto';
}

type HoverContextData = ContextData & {
  hoverInteractionState?: HoverInteraction | undefined;
};

export function useHoverInteractionSharedState(
  getStore: () => FloatingRootContext,
): () => HoverInteraction {
  const data = untrack(() => getStore().context.dataRef.current) as HoverContextData;
  const instance = data.hoverInteractionState ?? new HoverInteraction();

  if (!data.hoverInteractionState) {
    data.hoverInteractionState = instance;
  }

  const currentInstance = $derived.by(() => {
    const nextData = getStore().context.dataRef.current as HoverContextData;
    if (!nextData.hoverInteractionState) nextData.hoverInteractionState = instance;
    return nextData.hoverInteractionState;
  });
  onMount(data.hoverInteractionState.disposeEffect);

  return () => currentInstance;
}
