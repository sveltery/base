// Derived from Base UI v1.8.0 packages/react/src/dialog/store/DialogHandle.ts
// and packages/react/src/utils/popups/popupHandle.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// No ref object. Detached triggers read `store`, which is `$state` on this class.

import { DEV } from 'esm-env';
import { SvelteMap } from 'svelte/reactivity';
import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
import { AnimationFrame } from '../internal/timeout.js';
import { PopupTriggerMap } from '../internal/popups/popupTriggerMap.js';
import type { DialogStore } from './store.svelte.js';

export class DialogHandle<Payload = unknown> {
	attached = $state<DialogStore<Payload> | null>(null);
	readonly fallbackTriggers = new PopupTriggerMap();
	readonly payloads = new SvelteMap<string, Payload>();
	private readonly stack: DialogStore<Payload>[] = [];
	private overlapFrame: AnimationFrame | undefined;

	get store() {
		return this.attached;
	}

	attach(store: DialogStore<Payload>) {
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
					'Base UI: DialogHandle.open() was called while no root using this handle is mounted. ' +
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

		if (triggerId && !trigger && DEV) {
			console.warn(
				`Base UI: DialogHandle.open: No trigger found with id "${triggerId}". ` +
					'The popup will open, but the trigger will not be associated with it.'
			);
		}

		if (triggerId && this.payloads.has(triggerId)) {
			store.payload = this.payloads.get(triggerId);
		}
		store.setOpen(true, createChangeEventDetails(REASONS.imperativeAction, undefined, trigger));
	}

	openWithPayload(payload: Payload) {
		const store = this.attached;
		if (!store) {
			if (DEV) {
				console.warn(
					'Base UI: DialogHandle.openWithPayload() was called while no root using this handle is mounted. ' +
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
					'Base UI: DialogHandle.close() was called while no root using this handle is mounted. ' +
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

export function createDialogHandle<Payload = unknown>() {
	return new DialogHandle<Payload>();
}
