// PreviewCard's public handle. The implementation is the shared PopupHandle.
// Derived from Base UI v1.9.0 packages/react/src/preview-card/store/PreviewCardHandle.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// No ref object. An anchored card refuses to open when its trigger id is missing.

import { PopupHandle } from '../internal/popups/popupHandle.svelte.js';
import type { PreviewCardStore } from './store.svelte.js';

export class PreviewCardHandle<Payload = unknown> extends PopupHandle<Payload, PreviewCardStore> {
	constructor() {
		super(true, 'PreviewCard.Handle');
	}
}

export function createPreviewCardHandle<Payload = unknown>(): PreviewCardHandle<Payload> {
	return new PreviewCardHandle<Payload>();
}
