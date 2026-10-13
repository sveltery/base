// Menu's public handle. The implementation is the shared PopupHandle.
// Derived from Base UI v1.9.0 packages/react/src/menu/store/MenuHandle.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// An anchored menu refuses to open when its trigger id is missing. No `$effect`, so a
// module-scope `Menu.createHandle()` creates no effect.

import { PopupHandle } from '../internal/popups/popupHandle.svelte.js';
import type { MenuStore } from './store.svelte.js';

export class MenuHandle<Payload = unknown> extends PopupHandle<Payload, MenuStore> {
	constructor() {
		super(true, 'Menu.Handle');
	}
}

export function createMenuHandle<Payload = unknown>(): MenuHandle<Payload> {
	return new MenuHandle<Payload>();
}
