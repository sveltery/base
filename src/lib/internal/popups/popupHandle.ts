// Derived from Base UI v1.8.0 packages/react/src/utils/popups/popupHandle.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// A handle is a plain object. It does not create state or effects, so
// `createHandle()` is safe at module scope. The root store attaches its
// effects when a Root mounts.

import { DEV } from 'esm-env';
import {
	createChangeEventDetails,
	type BaseUIChangeEventDetails,
	REASONS
} from '../event-details.js';
import { AnimationFrame } from '../timeout.js';
import type { PopupTriggerMap } from './popupTriggerMap.js';

export interface PopupHandleStore {
	readonly triggers: PopupTriggerMap;
	setOpen(open: boolean, details: BaseUIChangeEventDetails<string>): void;
}

export class BasePopupHandle<Store extends PopupHandleStore> {
	private readonly attachedStores: Store[] = [];
	private attachedStoreValue: Store | null = null;
	private readonly listeners = new Set<() => void>();
	private overlapFrame: AnimationFrame | undefined;

	constructor(
		readonly fallback: PopupHandleStore,
		private readonly componentName: string,
		private readonly throwOnMissingTrigger = true
	) {}

	protected get attachedStore() {
		return this.attachedStoreValue;
	}

	/** Live root store, or the inert fallback while no root is mounted. */
	get store(): PopupHandleStore {
		return this.attachedStoreValue ?? this.fallback;
	}

	/** Live root when one is attached. Detached triggers use this to retarget. */
	get rootStore(): Store | null {
		return this.attachedStoreValue;
	}

	subscribe(listener: () => void) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	attachStore(store: Store) {
		this.attachedStores.push(store);
		this.setActiveStore(store);
		if (DEV && this.attachedStores.length > 1) {
			this.overlapFrame ??= AnimationFrame.create();
			this.overlapFrame.request(() => {
				if (this.attachedStores.length > 1) {
					console.warn(
						'Base UI: A handle is attached to more than one mounted root at the same time. ' +
							'The most recently mounted root takes over and the previous one stops being controlled by the handle. ' +
							'A handle should be used by a single root that stays mounted for the lifetime of the handle.'
					);
				}
			});
		}
		return () => {
			const index = this.attachedStores.lastIndexOf(store);
			if (index !== -1) this.attachedStores.splice(index, 1);
			this.setActiveStore(this.attachedStores[this.attachedStores.length - 1] ?? null);
		};
	}

	private setActiveStore(store: Store | null) {
		if (this.attachedStoreValue === store) return;
		this.attachedStoreValue = store;
		for (const listener of this.listeners) listener();
	}

	protected openByTrigger(triggerId: string | null | undefined) {
		const attached = this.attachedStoreValue;
		if (!attached) {
			if (DEV) {
				console.warn(
					`Base UI: ${this.componentName}Handle.open() was called while no root using this handle is mounted. ` +
						'The call was ignored; mount a root with this handle before opening it imperatively.'
				);
			}
			return;
		}

		let trigger: Element | undefined;
		if (triggerId) {
			for (let index = this.attachedStores.length - 1; index >= 0 && !trigger; index -= 1) {
				trigger = this.attachedStores[index].triggers.getById(triggerId);
			}
			trigger ??= this.fallback.triggers.getById(triggerId);
		}

		if (triggerId && !trigger) {
			if (this.throwOnMissingTrigger) {
				throw new Error(
					`Base UI: ${this.componentName}Handle.open() was called with the trigger id "${triggerId}", ` +
						'but no matching trigger is registered with this handle. ' +
						'An anchored popup cannot open without a trigger to anchor to. ' +
						`Pass the id of a mounted ${this.componentName}.Trigger that has this handle set on its "handle" prop.`
				);
			}
			if (DEV) {
				console.warn(
					`Base UI: ${this.componentName}Handle.open: No trigger found with id "${triggerId}". ` +
						'The popup will open, but the trigger will not be associated with it.'
				);
			}
		}

		attached.setOpen(true, createChangeEventDetails(REASONS.imperativeAction, undefined, trigger));
	}

	protected closePopup() {
		const attached = this.attachedStoreValue;
		if (!attached) {
			if (DEV) {
				console.warn(
					`Base UI: ${this.componentName}Handle.close() was called while no root using this handle is mounted. ` +
						'The call was ignored.'
				);
			}
			return;
		}
		attached.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}
}
