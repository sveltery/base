// Derived from Base UI v1.9.0 packages/react/src/drawer/handle.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { DialogHandle } from '../dialog/handle.svelte.js';

/**
 * Controls a drawer imperatively and connects detached `Drawer.Trigger`s to a `Drawer.Root`.
 * Create one with `Drawer.createHandle()`. Calls made while no root using the handle is mounted
 * are ignored.
 */
export class DrawerHandle<Payload = unknown> extends DialogHandle<Payload> {
	// A type-only brand: a `Dialog.Handle` does not fit a drawer root or trigger.
	declare private readonly drawerBrand: never;
}

export function createDrawerHandle<Payload = unknown>() {
	return new DrawerHandle<Payload>();
}
