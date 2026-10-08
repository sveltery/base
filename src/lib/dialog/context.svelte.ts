// Derived from Base UI v1.8.0 packages/react/src/dialog/root/DialogRootContext.ts
// and packages/react/src/dialog/portal/DialogPortalContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, hasContext, setContext } from 'svelte';
import type { DialogStore } from './store.svelte.js';

const ROOT = Symbol('dialog-root');
const PORTAL = Symbol('dialog-portal');

export function setDialogRootContext(store: DialogStore<unknown>) {
	setContext(ROOT, store);
}

export function useDialogRootContext(optional: true): DialogStore<unknown> | undefined;
export function useDialogRootContext(optional?: false): DialogStore<unknown>;
export function useDialogRootContext(optional = false) {
	if (!hasContext(ROOT)) {
		if (optional) return undefined;
		throw new Error(
			'Base UI: DialogRootContext is missing. Dialog parts must be placed within <Dialog.Root>.'
		);
	}
	return getContext<DialogStore<unknown>>(ROOT);
}

export interface DialogPortalContext {
	readonly keepMounted: boolean;
}

export function setDialogPortalContext(value: DialogPortalContext) {
	setContext(PORTAL, value);
}

export function useDialogPortalContext() {
	if (!hasContext(PORTAL)) {
		throw new Error('Base UI: <Dialog.Portal> is missing.');
	}
	return getContext<DialogPortalContext>(PORTAL);
}
