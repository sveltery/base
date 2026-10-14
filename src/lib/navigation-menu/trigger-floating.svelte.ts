// Derived from the per-trigger `useFloatingRootContext` call in Base UI v1.9.0
// packages/react/src/navigation-menu/trigger/NavigationMenuTrigger.tsx
// and packages/react/src/floating-ui-react/components/FloatingRootStore.ts `setOpen`
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Each trigger owns a floating store, so hover timers and the open event stay per trigger.
// It is open while the root is open, its reference is the trigger, and its floating element
// is the positioner, or the viewport of a menu without one.

import { FloatingRootStore } from '@sveltery/floating-ui-svelte';
import type { BaseUIChangeEventDetails } from '@sveltery/utils';
import type { NavigationMenuRootStore } from './root-store.svelte.js';

export class NavigationMenuTriggerFloating extends FloatingRootStore {
	constructor(
		private readonly root: NavigationMenuRootStore,
		floatingId: string,
		private readonly onOpenChange: (
			open: boolean,
			details: BaseUIChangeEventDetails<string>
		) => void
	) {
		super({ nested: root.nested, floatingId, floatingElementKind: 'positioner' });
		this.nodeId = root.nodeId;
		// The floating element follows the root. Nothing writes it on this store.
		Object.defineProperty(this, 'floatingElement', {
			configurable: true,
			get: () => root.hoverFloatingElement,
			set: () => {}
		});
		// The content of every item registers its portals on the root.
		Object.defineProperty(this, 'nestedPortals', { get: () => root.floating.nestedPortals });
	}

	override isOpen() {
		return this.root.open;
	}

	override setOpen(nextOpen: boolean, eventDetails: BaseUIChangeEventDetails<string>) {
		this.dispatchOpenChange(nextOpen, eventDetails);
		this.onOpenChange(nextOpen, eventDetails);
	}
}
