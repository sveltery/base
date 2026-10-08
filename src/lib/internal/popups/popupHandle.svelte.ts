// Derived from Base UI v1.8.0 packages/react/src/utils/popups/popupHandle.ts
// and packages/react/src/dialog/store/DialogHandle.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// One handle for Dialog and Popover. No ref object.
// `attached` is `$state.raw`: reassignment is tracked, and the store is not proxied.

import { DEV } from 'esm-env';
import { SvelteMap } from 'svelte/reactivity';
import { createChangeEventDetails, REASONS } from '../event-details.js';
import type { BaseUIChangeEventDetails } from '../event-details.js';
import { AnimationFrame } from '../timeout.js';
import { PopupTriggerMap } from './popupTriggerMap.js';

export interface PopupHandleStore<Payload> {
	open: boolean;
	triggers: PopupTriggerMap;
	readonly payload?: Payload;
	setOpen(nextOpen: boolean, eventDetails: BaseUIChangeEventDetails<string>): void;
	forceUnmount?(): void;
}

export class PopupHandle<
	Payload = unknown,
	Store extends PopupHandleStore<Payload> = PopupHandleStore<Payload>
> {
	/** Anchored popups throw when `open(id)` cannot find that trigger. Dialog still opens. */
	constructor(private readonly requireTrigger = false) {}

	attached = $state.raw<Store | null>(null);
	readonly fallbackTriggers = new PopupTriggerMap();
	readonly payloads = new SvelteMap<string, Payload>();
	private readonly stack: Store[] = [];
	private overlapFrame: AnimationFrame | undefined;

	get store() {
		return this.attached;
	}

	attach(store: Store) {
		this.stack.push(store);
		this.attached = store;
		if (DEV && this.stack.length > 1) {
			this.overlapFrame ??= AnimationFrame.create();
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

	open(triggerId: string | null) {
		const store = this.attached;
		if (!store) {
			if (DEV) {
				console.warn(
					'Base UI: PopupHandle.open() was called while no root using this handle is mounted. ' +
						'The call was ignored; mount a root with this handle before opening it imperatively.'
				);
			}
			return;
		}

		let trigger: Element | undefined;
		if (triggerId) {
			for (let index = this.stack.length - 1; index >= 0 && !trigger; index -= 1) {
				trigger = this.stack[index].triggers.getById(triggerId);
			}
			trigger ??= this.fallbackTriggers.getById(triggerId);
		}

		if (triggerId && !trigger) {
			if (this.requireTrigger) {
				throw new Error(
					`Base UI: PopupHandle.open() was called with the trigger id "${triggerId}", ` +
						'but no matching trigger is registered with this handle. ' +
						'An anchored popup cannot open without a trigger to anchor to. ' +
						'Pass the id of a mounted trigger that has this handle set on its "handle" prop.'
				);
			}
			if (DEV) {
				console.warn(
					`Base UI: PopupHandle.open: No trigger found with id "${triggerId}". ` +
						'The popup will open, but the trigger will not be associated with it.'
				);
			}
		}

		if (triggerId && this.payloads.has(triggerId)) {
			assignPayload(store, this.payloads.get(triggerId));
		}
		store.setOpen(true, createChangeEventDetails(REASONS.imperativeAction, undefined, trigger));
	}

	setPayload(id: string, payload: Payload | undefined) {
		if (payload === undefined) this.payloads.delete(id);
		else this.payloads.set(id, payload);
	}

	forgetPayload(id: string) {
		this.payloads.delete(id);
	}

	get payload(): Payload | undefined {
		return this.attached?.payload;
	}

	unmount() {
		this.attached?.forceUnmount?.();
	}

	openWithPayload(payload: Payload) {
		const store = this.attached;
		if (!store) {
			if (DEV) {
				console.warn(
					'Base UI: PopupHandle.openWithPayload() was called while no root using this handle is mounted. ' +
						'The call and its payload were ignored; mount a root with this handle before opening it imperatively.'
				);
			}
			return;
		}
		store.payload = payload;
		store.setOpen(true, createChangeEventDetails(REASONS.imperativeAction));
	}

	close() {
		const store = this.attached;
		if (!store) {
			if (DEV) {
				console.warn(
					'Base UI: PopupHandle.close() was called while no root using this handle is mounted. ' +
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

function assignPayload<Payload>(store: { payload?: Payload }, value: Payload | undefined) {
	let current: object | null = store;
	while (current) {
		const desc = Object.getOwnPropertyDescriptor(current, 'payload');
		if (desc) {
			if (desc.set || desc.writable) store.payload = value;
			return;
		}
		current = Object.getPrototypeOf(current);
	}
	store.payload = value;
}
