// Derived from Base UI v1.8.0 packages/react/src/dialog/root/DialogRootContext.ts
// and packages/react/src/dialog/portal/DialogPortalContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { getContext, hasContext, setContext } from 'svelte';
import type { DialogClickReference, DialogStore } from './store.svelte.js';

const ROOT = Symbol('dialog-root');
const PORTAL = Symbol('dialog-portal');

export interface DialogRootContext {
	readonly store: DialogStore<unknown>;
	readonly click: DialogClickReference;
}

function readRoot(optional: boolean) {
	if (!hasContext(ROOT)) {
		if (optional) return undefined;
		throw new Error(
			'Base UI: DialogRootContext is missing. Dialog parts must be placed within <Dialog.Root>.'
		);
	}
	return getContext<DialogRootContext>(ROOT);
}

export function setDialogRootContext(value: DialogRootContext) {
	setContext(ROOT, value);
}

export function useDialogRoot(optional: true): DialogRootContext | undefined;
export function useDialogRoot(optional?: false): DialogRootContext;
export function useDialogRoot(optional = false) {
	return readRoot(optional) as DialogRootContext;
}

export function useDialogRootContext(optional: true): DialogStore<unknown> | undefined;
export function useDialogRootContext(optional?: false): DialogStore<unknown>;
export function useDialogRootContext(optional = false) {
	return readRoot(optional)?.store as DialogStore<unknown>;
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
