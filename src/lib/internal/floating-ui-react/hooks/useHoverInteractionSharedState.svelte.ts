// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/hooks/useHoverInteractionSharedState.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Hover timers live on the popup store. The scope map only coordinates pointer-events
// when two popups share one element, matching upstream.

import { Timeout } from '../../timeout.js';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import type { HandleClose, SafePolygonOptions } from '../safePolygon.js';

export class HoverInteraction {
	pointerType: string | undefined;
	interactedInside = false;
	handler: ((event: MouseEvent) => void) | undefined;
	blockMouseMove = true;
	performedPointerEventsMutation = false;
	pointerEventsScopeElement: HTMLElement | SVGSVGElement | null = null;
	pointerEventsReferenceElement: HTMLElement | SVGSVGElement | null = null;
	pointerEventsFloatingElement: HTMLElement | null = null;
	restTimeoutPending = false;
	readonly openChangeTimeout = new Timeout();
	readonly restTimeout = new Timeout();
	/** Read by event handlers. Not state: nothing renders them. */
	handleClose: HandleClose | null = null;
	handleCloseOptions: SafePolygonOptions | undefined = undefined;

	dispose() {
		this.openChangeTimeout.clear();
		this.restTimeout.clear();
	}
}

/** Which popup currently owns `pointer-events` on a shared scope element. */
const pointerEventsOwnerByScope = new WeakMap<HTMLElement | SVGSVGElement, HoverInteraction>();

export function hoverInteraction(store: FloatingRootStore) {
	store.hoverInteraction ??= new HoverInteraction();
	return store.hoverInteraction;
}

export function clearSafePolygonPointerEventsMutation(instance: HoverInteraction) {
	if (!instance.performedPointerEventsMutation) return;
	const scopeElement = instance.pointerEventsScopeElement;
	if (scopeElement && pointerEventsOwnerByScope.get(scopeElement) === instance) {
		instance.pointerEventsScopeElement?.style.removeProperty('pointer-events');
		instance.pointerEventsReferenceElement?.style.removeProperty('pointer-events');
		instance.pointerEventsFloatingElement?.style.removeProperty('pointer-events');
		pointerEventsOwnerByScope.delete(scopeElement);
	}
	instance.performedPointerEventsMutation = false;
	instance.pointerEventsScopeElement = null;
	instance.pointerEventsReferenceElement = null;
	instance.pointerEventsFloatingElement = null;
}

export function applySafePolygonPointerEventsMutation(
	instance: HoverInteraction,
	options: {
		scopeElement: HTMLElement | SVGSVGElement;
		referenceElement: HTMLElement | SVGSVGElement;
		floatingElement: HTMLElement;
	}
) {
	const existing = pointerEventsOwnerByScope.get(options.scopeElement);
	if (existing && existing !== instance) clearSafePolygonPointerEventsMutation(existing);
	clearSafePolygonPointerEventsMutation(instance);
	instance.performedPointerEventsMutation = true;
	instance.pointerEventsScopeElement = options.scopeElement;
	instance.pointerEventsReferenceElement = options.referenceElement;
	instance.pointerEventsFloatingElement = options.floatingElement;
	pointerEventsOwnerByScope.set(options.scopeElement, instance);
	options.scopeElement.style.pointerEvents = 'none';
	options.referenceElement.style.pointerEvents = 'auto';
	options.floatingElement.style.pointerEvents = 'auto';
}
