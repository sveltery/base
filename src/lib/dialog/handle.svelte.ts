// Dialog's public handle. Shared open, close, and attach live on PopupHandle.
// Derived from Base UI v1.8.0 packages/react/src/dialog/store/DialogHandle.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Payload storage is Dialog-only. Upstream Popover reads the active trigger's payload
// and does not accept openWithPayload.

import { DEV } from 'esm-env';
import { SvelteMap } from 'svelte/reactivity';
import { createChangeEventDetails, REASONS } from '../internal/event-details.js';
import { PopupHandle } from '../internal/popups/index.js';
import type { DialogStore } from './store.svelte.js';

export class DialogHandle<Payload = unknown> extends PopupHandle<Payload, DialogStore<Payload>> {
	readonly payloads = new SvelteMap<string, Payload>();

	setPayload(id: string, payload: Payload | undefined) {
		if (payload === undefined) this.payloads.delete(id);
		else this.payloads.set(id, payload);
	}

	forgetPayload(id: string) {
		this.payloads.delete(id);
	}

	override open(triggerId: string | null) {
		const store = this.attached;
		// Assign only after the trigger is registered. `super.open` throws when an
		// anchored popup cannot find that id, and the payload must stay unchanged.
		if (store && triggerId && this.payloads.has(triggerId) && this.triggerElement(triggerId)) {
			store.payload = this.payloads.get(triggerId);
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
