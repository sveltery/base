// Dialog's public handle. The implementation lives with the popup store so Popover
// can use it without copying it.
import { PopupHandle } from '../internal/popups/index.js';
import type { DialogStore } from './store.svelte.js';

export type DialogHandle<Payload = unknown> = PopupHandle<Payload, DialogStore<Payload>>;

export function createDialogHandle<Payload = unknown>() {
	return new PopupHandle<Payload, DialogStore<Payload>>();
}
