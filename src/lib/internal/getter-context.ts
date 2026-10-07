import { getContext, hasContext, setContext } from 'svelte';

/**
 * Context whose value is an object of getters.
 * `provide` runs in the provider's init. `read` runs in a descendant's init.
 * Descendants read the properties later, so the provider props stay current.
 */
export function createGetterContext<T extends object>(fallback: T) {
	const key = Symbol();
	return {
		provide(value: T) {
			setContext(key, value);
		},
		read(): T {
			if (!hasContext(key)) return fallback;
			return getContext<T>(key);
		}
	};
}
