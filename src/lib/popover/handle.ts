// Derived from Base UI v1.8.0 packages/react/src/popover/store/PopoverHandle.ts
// and packages/react/src/utils/popups/popupHandle.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// Plain object. Module-scope `Popover.createHandle()` creates no effects.

import { BasePopupHandle } from '../internal/popups/popupHandle.js';
import { PopupTriggerMap } from '../internal/popups/popupTriggerMap.js';
import type { PopoverStore } from './store.svelte.js';

export class PopoverHandle<Payload = unknown> extends BasePopupHandle<PopoverStore> {
	readonly payloads = new Map<string, Payload>();

	constructor() {
		super(
			{
				triggers: new PopupTriggerMap(),
				setOpen() {}
			},
			'Popover'
		);
	}

	get isOpen() {
		return this.attachedStore?.open ?? false;
	}

	get payload(): Payload | undefined {
		return this.attachedStore?.payload as Payload | undefined;
	}

	setPayload(id: string, payload: Payload | undefined) {
		if (payload === undefined) this.payloads.delete(id);
		else this.payloads.set(id, payload);
	}

	forgetPayload(id: string) {
		this.payloads.delete(id);
	}

	open(triggerId: string) {
		this.openByTrigger(triggerId);
	}

	close() {
		this.closePopup();
	}

	unmount() {
		this.attachedStore?.forceUnmount();
	}
}

export function createPopoverHandle<Payload = unknown>() {
	return new PopoverHandle<Payload>();
}
