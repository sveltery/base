// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/hooks/useHoverInteractionSharedState.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { Timeout } from '../../timeout.js';
import type { FloatingRootStore } from '../components/FloatingRootStore.svelte.js';
import type { SafePolygonOptions } from '../safePolygon.js';

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
	handleCloseOptions: SafePolygonOptions | undefined;

	dispose() {
		this.openChangeTimeout.clear();
		this.restTimeout.clear();
	}
}

const states = new WeakMap<FloatingRootStore, HoverInteraction>();
const owners = new WeakMap<HTMLElement | SVGSVGElement, HoverInteraction>();

export function hoverInteraction(store: FloatingRootStore) {
	let instance = states.get(store);
	if (!instance) {
		instance = new HoverInteraction();
		states.set(store, instance);
	}
	return instance;
}

export function clearSafePolygonPointerEventsMutation(instance: HoverInteraction) {
	if (!instance.performedPointerEventsMutation) return;
	const scopeElement = instance.pointerEventsScopeElement;
	if (scopeElement && owners.get(scopeElement) === instance) {
		instance.pointerEventsScopeElement?.style.removeProperty('pointer-events');
		instance.pointerEventsReferenceElement?.style.removeProperty('pointer-events');
		instance.pointerEventsFloatingElement?.style.removeProperty('pointer-events');
		owners.delete(scopeElement);
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
	const existing = owners.get(options.scopeElement);
	if (existing && existing !== instance) clearSafePolygonPointerEventsMutation(existing);
	clearSafePolygonPointerEventsMutation(instance);
	instance.performedPointerEventsMutation = true;
	instance.pointerEventsScopeElement = options.scopeElement;
	instance.pointerEventsReferenceElement = options.referenceElement;
	instance.pointerEventsFloatingElement = options.floatingElement;
	owners.set(options.scopeElement, instance);
	options.scopeElement.style.pointerEvents = 'none';
	options.referenceElement.style.pointerEvents = 'auto';
	options.floatingElement.style.pointerEvents = 'auto';
}
