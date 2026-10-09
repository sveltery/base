// Derived from Base UI v1.8.0 packages/react/src/utils/popups/popupHandle.ts
// and packages/react/src/dialog/store/DialogHandle.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// One handle for Dialog and Popover. No ref object.
// `attached` is `$state.raw`: reassignment is tracked, and the store is not proxied.
// Dialog-only payload writers live on `DialogHandle`. Popover's payload is read from
// the active trigger and is not assigned here.

import { DEV } from 'esm-env';
import { createChangeEventDetails, REASONS } from '../event-details.js';
import type { BaseUIChangeEventDetails } from '../event-details.js';
import { useAnimationFrame } from '../timeout.svelte.js';
import type { AnimationFrame } from '../timeout.js';
import { PopupTriggerMap } from './popupTriggerMap.js';

export interface PopupHandleStore {
	open: boolean;
	triggers: PopupTriggerMap;
	setOpen(nextOpen: boolean, eventDetails: BaseUIChangeEventDetails<string>): void;
	forceUnmount?(): void;
}

export class PopupHandle<Payload = unknown, Store extends PopupHandleStore = PopupHandleStore> {
	/** Anchored popups throw when `open(id)` cannot find that trigger. Dialog still opens. */
	constructor(
		private readonly requireTrigger = false,
		private readonly handleName = 'Popup.Handle'
	) {}

	attached = $state.raw<Store | null>(null);
	readonly fallbackTriggers = new PopupTriggerMap();
	private readonly stack: Store[] = [];
	private overlapFrame: AnimationFrame | undefined;

	get store() {
		return this.attached;
	}

	attach(store: Store) {
		this.stack.push(store);
		this.attached = store;
		if (DEV && this.stack.length > 1) {
			this.overlapFrame ??= useAnimationFrame();
			this.overlapFrame.request(() => {
				if (this.stack.length > 1) {
					console.warn(
						'Base UI: A handle is attached to more than one mounted root at the same time. ' +
							'The most recently mounted root takes over and the previous one stops being controlled by the handle. ' +
							'A handle should be used by a single root that stays mounted for the lifetime of the handle.'
					);
				}
			});
		}
		return () => {
			const index = this.stack.lastIndexOf(store);
			if (index !== -1) this.stack.splice(index, 1);
			this.attached = this.stack[this.stack.length - 1] ?? null;
		};
	}

	triggers() {
		return this.attached?.triggers ?? this.fallbackTriggers;
	}

	/** The mounted trigger registered under `triggerId`, if this handle has one. */
	triggerElement(triggerId: string): Element | undefined {
		let trigger: Element | undefined;
		for (let index = this.stack.length - 1; index >= 0 && !trigger; index -= 1) {
			trigger = this.stack[index].triggers.getById(triggerId);
		}
		return trigger ?? this.fallbackTriggers.getById(triggerId);
	}

	open(triggerId: string | null) {
		const store = this.attached;
		if (!store) {
			if (DEV) {
				console.warn(
					`Base UI: ${this.handleName}.open() was called while no root using this handle is mounted. ` +
						'The call was ignored; mount a root with this handle before opening it imperatively.'
				);
			}
			return;
		}

		const trigger = triggerId ? this.triggerElement(triggerId) : undefined;

		if (triggerId && !trigger) {
			if (this.requireTrigger) {
				throw new Error(
					`Base UI: ${this.handleName}.open() was called with the trigger id "${triggerId}", ` +
						'but no matching trigger is registered with this handle. ' +
						'An anchored popup cannot open without a trigger to anchor to. ' +
						'Pass the id of a mounted trigger that has this handle set on its "handle" prop.'
				);
			}
			if (DEV) {
				console.warn(
					`Base UI: ${this.handleName}.open: No trigger found with id "${triggerId}". ` +
						'The popup will open, but the trigger will not be associated with it.'
				);
			}
		}

		store.setOpen(true, createChangeEventDetails(REASONS.imperativeAction, undefined, trigger));
	}

	get payload(): Payload | undefined {
		return (this.attached as { payload?: Payload } | null)?.payload;
	}

	unmount() {
		this.attached?.forceUnmount?.();
	}

	close() {
		const store = this.attached;
		if (!store) {
			if (DEV) {
				console.warn(
					`Base UI: ${this.handleName}.close() was called while no root using this handle is mounted. ` +
						'The call was ignored.'
				);
			}
			return;
		}
		store.setOpen(false, createChangeEventDetails(REASONS.imperativeAction));
	}

	get isOpen() {
		return this.attached?.open ?? false;
	}
}
