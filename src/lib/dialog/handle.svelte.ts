// Dialog's public handle. Shared open, close, and attach live on PopupHandle.
// Derived from Base UI v1.8.0 packages/react/src/dialog/store/DialogHandle.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Payload lives on the registered trigger, the way upstream forwards it through
// trigger registration. `setPayload` ignores an id that has no trigger.
// Upstream Popover reads the active trigger's payload and does not accept openWithPayload.

import { DEV } from 'esm-env';
import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
import { PopupHandle } from '../internal/popups/index.js';
import type { DialogStore } from './store.svelte.js';

export class DialogHandle<Payload = unknown> extends PopupHandle<Payload, DialogStore<Payload>> {
	/** Payload for a trigger that is already registered. Unknown ids are never stored. */
	private readonly triggerPayloads = new Map<string, Payload>();

	constructor() {
		super(false, 'Dialog.Handle');
	}

	setPayload(id: string, payload: Payload | undefined) {
		if (!this.triggerElement(id)) return false;
		if (payload === undefined) this.triggerPayloads.delete(id);
		else this.triggerPayloads.set(id, payload);
		return true;
	}

	forgetPayload(id: string) {
		this.triggerPayloads.delete(id);
	}

	override open(triggerId: string | null) {
		const store = this.attached;
		// Dialog warns on an unknown id. It does not throw, and the displayed payload stays.
		if (
			store &&
			triggerId &&
			this.triggerElement(triggerId) &&
			this.triggerPayloads.has(triggerId)
		) {
			store.payload = this.triggerPayloads.get(triggerId);
		}
		super.open(triggerId);
	}

	openWithPayload(payload: Payload) {
		const store = this.attached;
		if (!store) {
			if (DEV) {
				console.warn(
					'Base UI: Dialog.Handle.openWithPayload() was called while no root using this handle is mounted. ' +
						'The call and its payload were ignored; mount a root with this handle before opening it imperatively.'
				);
			}
			return;
		}
		store.payload = payload;
		store.setOpen(true, createChangeEventDetails(REASONS.imperativeAction));
	}
}

export function createDialogHandle<Payload = unknown>() {
	return new DialogHandle<Payload>();
}
