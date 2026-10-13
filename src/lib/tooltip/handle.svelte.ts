// Tooltip's public handle. The implementation is the shared PopupHandle.
// Derived from Base UI v1.9.0 packages/react/src/tooltip/store/TooltipHandle.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// No ref object and no `$effect`, so a module-scope `Tooltip.createHandle()` works.
// An anchored tooltip refuses to open when its trigger id is not registered.

import { PopupHandle } from '../internal/popups/popupHandle.svelte.js';
import type { TooltipStore } from './store.svelte.js';

export class TooltipHandle<Payload = unknown> extends PopupHandle<Payload, TooltipStore> {
	constructor() {
		super(true, 'Tooltip.Handle');
	}
}

export function createTooltipHandle<Payload = unknown>(): TooltipHandle<Payload> {
	return new TooltipHandle<Payload>();
}
