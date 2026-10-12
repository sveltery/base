// Derived from Base UI v1.8.0 packages/react/src/dialog/root/DialogRootContext.ts
// and packages/react/src/dialog/portal/DialogPortalContext.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { defineContext } from '../internal/context.js';
import type { DialogClickReference, DialogStore } from './store.svelte.js';

export interface DialogRootContext {
	readonly store: DialogStore<unknown>;
	readonly click: DialogClickReference;
}

export const [useDialogRoot, setDialogRootContext, findDialogRoot] =
	defineContext<DialogRootContext>(
		'Base UI: DialogRootContext is missing. Dialog parts must be placed within <Dialog.Root>.'
	);

export function useDialogRootContext(): DialogStore<unknown> {
	return useDialogRoot().store;
}

export interface DialogPortalContext {
	readonly keepMounted: boolean;
}

export const [useDialogPortalContext, setDialogPortalContext] = defineContext<DialogPortalContext>(
	'Base UI: <Dialog.Portal> is missing.'
);
