// Derived from Base UI v1.9.0 packages/react/src/alert-dialog/handle.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { DialogHandle } from '../dialog/handle.svelte.js';

/**
 * Controls an alert dialog imperatively and connects detached `AlertDialog.Trigger`s to an
 * `AlertDialog.Root`. Create one with `AlertDialog.createHandle()`.
 * Calls made while no root using the handle is mounted are ignored.
 */
export class AlertDialogHandle<Payload = unknown> extends DialogHandle<Payload> {
	// A type-only brand: a `Dialog.Handle` does not fit an alert dialog root or trigger.
	declare private readonly alertDialogBrand: never;
}

export function createAlertDialogHandle<Payload = unknown>() {
	return new AlertDialogHandle<Payload>();
}
