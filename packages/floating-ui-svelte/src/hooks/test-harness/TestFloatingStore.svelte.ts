// Test store with a plain open bit, like upstream's test `useFloating({ open, onOpenChange })`.

import type { BaseUIChangeEventDetails } from '@sveltery/utils';
import { FloatingRootStore } from '../../components/FloatingRootStore.svelte.js';

let nextId = 0;

export class TestFloatingStore extends FloatingRootStore {
	open = $state(false);
	readonly openChanges: Array<{ open: boolean; reason: string }> = [];

	constructor(initialOpen = false, nested = false) {
		nextId += 1;
		super({ nested, floatingId: `test-floating-${nextId}`, floatingElementKind: 'popup' });
		this.open = initialOpen;
	}

	override isOpen() {
		return this.open;
	}

	override setOpen(nextOpen: boolean, details: BaseUIChangeEventDetails<string>) {
		this.openChanges.push({ open: nextOpen, reason: details.reason });
		this.syncOpenEvent(nextOpen, details.event);
		this.open = nextOpen;
	}
}
