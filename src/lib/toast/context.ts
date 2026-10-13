// Derived from Base UI v1.9.0 packages/react/src/toast/provider/ToastProviderContext.ts,
// packages/react/src/toast/root/ToastRootContext.ts,
// packages/react/src/toast/positioner/ToastPositionerContext.ts, and
// packages/react/src/toast/useToastManager.ts (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
// MIT, see THIRD_PARTY_NOTICES.md.

import { defineContext } from '../internal/context.js';
import type { AnchorPositioning } from '../internal/popups/index.js';
import type { LabelIdHost } from '../internal/popups/labelId.js';
import type { ToastStore } from './store.svelte.js';
import type { GetToastManagerReturnValue, ToastObject } from './types.js';

export const [useToastStore, setToastStore] = defineContext<ToastStore>(
	'Base UI: useToastManager must be used within <Toast.Provider>.'
);

export interface ToastRootContext extends LabelIdHost {
	readonly toast: ToastObject;
	readonly visibleIndex: number;
	readonly expanded: boolean;
	/** Measures the root's natural height and writes it to the store. */
	recalculateHeight: (flushSync?: boolean) => void;
}

export const [useToastRoot, setToastRoot] = defineContext<ToastRootContext>(
	'Base UI: ToastRootContext is missing. Toast parts must be used within <Toast.Root>.'
);

export const [useToastPositioner, setToastPositioner] = defineContext<AnchorPositioning>(
	'Base UI: ToastPositionerContext is missing. ToastPositioner parts must be placed within <Toast.Positioner>.'
);

/**
 * Returns the toasts and the methods that manage them. Call it during component init
 * inside `Toast.Provider`. Read `toasts` from the returned object; do not destructure it.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- upstream's default, see types.ts
export function getToastManager<Data extends object = any>(): GetToastManagerReturnValue<Data> {
	const store = useToastStore();
	return {
		get toasts() {
			return store.toasts as ToastObject<Data>[];
		},
		add: store.addToast,
		close: store.closeToast,
		update: store.updateToast,
		promise: store.promiseToast
	};
}
