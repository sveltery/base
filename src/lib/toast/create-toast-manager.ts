// Derived from Base UI v1.9.0 packages/react/src/toast/createToastManager.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// Upstream hides `subscribe` behind the string key `' subscribe'`. Here it is a module symbol
// that only `Toast.Provider` imports, so it is not part of the public surface.

import type { ToastManager, ToastManagerEvent, ToastObject } from './types.js';
import { generateId } from './utils.js';

export const toastManagerSubscribe: unique symbol = Symbol('toastManagerSubscribe');

/** Creates a toast manager for adding and updating toasts outside of components. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- upstream's default, see types.ts
export function createToastManager<Data extends object = any>(): ToastManager<Data> {
	const listeners = new Set<(event: ToastManagerEvent) => void>();

	function emit(event: ToastManagerEvent) {
		listeners.forEach((listener) => listener(event));
	}

	return {
		[toastManagerSubscribe](listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},

		add(options) {
			const id = options.id || generateId('toast');
			const toastToAdd: ToastObject = { ...options, id, transitionStatus: 'starting' };
			emit({ action: 'add', options: toastToAdd });
			return id;
		},

		close(id) {
			emit({ action: 'close', options: { id } });
		},

		update(id, updates) {
			emit({ action: 'update', options: { id, updates } });
		},

		promise(promiseValue, options) {
			let handledPromise = promiseValue;
			emit({
				action: 'promise',
				options: {
					...options,
					promise: promiseValue,
					setPromise(promise) {
						handledPromise = promise;
					}
				}
			});
			return handledPromise;
		}
	};
}
