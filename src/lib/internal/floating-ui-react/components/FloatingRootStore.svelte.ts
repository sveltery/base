// Derived from Base UI v1.8.0 packages/react/src/floating-ui-react/components/FloatingRootStore.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// One store owns elements. There is no dataRef or nodesRef bag.

import type { BaseUIChangeEventDetails } from '../../event-details.js';
import { createEventEmitter, type FloatingEvents } from '../utils/createEventEmitter.js';

export interface OpenChangePayload {
	open: boolean;
	reason: string;
	nativeEvent: Event;
	nested: boolean;
	triggerElement: Element | undefined;
}

export class FloatingRootStore {
	domReferenceElement = $state<Element | null>(null);
	positionReference = $state<Element | null>(null);
	floatingElement = $state<HTMLElement | null>(null);
	popupElement = $state<HTMLElement | null>(null);
	positionerElement = $state<HTMLElement | null>(null);
	portalElement = $state<HTMLElement | null>(null);
	nodeId: string | null = null;
	readonly events: FloatingEvents = createEventEmitter();
	readonly data: {
		openEvent?: Event;
		escapeKeyBubbles?: boolean;
		outsidePressBubbles?: boolean;
	} = {};
	readonly nested: boolean;
	readonly floatingId: string;
	/** Which node is the floating element. Dialog uses the popup. Anchored popups use the positioner. */
	readonly floatingElementKind: 'popup' | 'positioner';

	constructor(options: {
		nested: boolean;
		floatingId: string;
		floatingElementKind: 'popup' | 'positioner';
	}) {
		this.nested = options.nested;
		this.floatingId = options.floatingId;
		this.floatingElementKind = options.floatingElementKind;
	}

	setOpen(_nextOpen: boolean, _eventDetails: BaseUIChangeEventDetails<string>) {}

	get referenceElement() {
		return this.positionReference ?? this.domReferenceElement;
	}

	syncOpenEvent(newOpen: boolean, event: Event | undefined) {
		const clickLike =
			event != null &&
			(event.type === 'click' || event.type === 'pointerdown' || event.type === 'mousedown');
		if (!newOpen || !this.isOpen() || clickLike) {
			this.data.openEvent = newOpen ? event : undefined;
		}
	}

	dispatchOpenChange(newOpen: boolean, eventDetails: BaseUIChangeEventDetails<string>) {
		this.syncOpenEvent(newOpen, eventDetails.event);
		const payload: OpenChangePayload = {
			open: newOpen,
			reason: eventDetails.reason,
			nativeEvent: eventDetails.event,
			nested: this.nested,
			triggerElement: eventDetails.trigger
		};
		this.events.emit('openchange', payload);
	}

	/** Subclasses own the open bit. The root only reads it. */
	isOpen(): boolean {
		return false;
	}
}
