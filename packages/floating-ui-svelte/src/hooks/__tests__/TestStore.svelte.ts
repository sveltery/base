import type { BaseUIChangeEventDetails } from '@sveltery/utils';
import {
	FloatingRootStore,
	type ReferenceElement
} from '../../components/FloatingRootStore.svelte.js';

let nextId = 0;

/** A minimal popup store for specs. It records the last open change so the DOM can show it. */
export class TestStore extends FloatingRootStore {
	open = $state(false);
	lastReason = $state<string | null>(null);
	positionReference = $state.raw<ReferenceElement | null>(null);

	constructor() {
		super({ nested: false, floatingId: `test-floating-${nextId++}`, floatingElementKind: 'popup' });
	}

	override isOpen() {
		return this.open;
	}

	override get referenceElement() {
		return this.positionReference ?? this.domReferenceElement;
	}

	override setOpen(nextOpen: boolean, details: BaseUIChangeEventDetails<string>) {
		if (nextOpen && details.trigger) this.domReferenceElement = details.trigger;
		this.dispatchOpenChange(nextOpen, details);
		this.lastReason = details.reason;
		this.open = nextOpen;
	}

	/** Registers a trigger element and returns the cleanup, for `{@attach}`. */
	registerTrigger = (element: Element) => {
		const id = `trigger-${nextId++}`;
		this.triggers.add(id, element);
		if (!this.domReferenceElement) this.domReferenceElement = element;
		return () => this.triggers.delete(id);
	};

	registerFloating = (element: HTMLElement) => {
		this.floatingElement = element;
		return () => {
			this.floatingElement = null;
		};
	};
}
