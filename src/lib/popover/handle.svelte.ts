// Popover's public handle. The implementation is the shared PopupHandle.
// Derived from Base UI v1.8.0 packages/react/src/popover/store/PopoverHandle.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// No ref object. An anchored popover refuses to open when its trigger id is missing.
// No `$effect`. Module-scope `Popover.createHandle()` does not create an effect.
// Dialog's payload map, setPayload, and openWithPayload are not on this class.

import { PopupHandle } from '../internal/popups/popupHandle.svelte.js';
import type { PopoverStore } from './store.svelte.js';

export class PopoverHandle<Payload = unknown> extends PopupHandle<Payload, PopoverStore> {
	constructor() {
		super(true);
	}
}

export function createPopoverHandle<Payload = unknown>(): PopoverHandle<Payload> {
	return new PopoverHandle<Payload>();
}
