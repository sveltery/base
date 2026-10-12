import { createContext } from 'svelte';

/**
 * Svelte context whose `get` throws Base UI's missing-provider message.
 * `find` returns `undefined` outside a provider, for parts that also work standalone.
 */
export function defineContext<T>(missing: string) {
	const [read, set, has] = createContext<T>();
	const find = (): T | undefined => (has() ? read() : undefined);
	const get = (): T => {
		if (!has()) throw new Error(missing);
		return read();
	};
	return [get, set, find] as const;
}

/** Svelte context that reads `fallback` outside a provider. */
export function defineOptionalContext<T>(fallback: T) {
	const [read, set, has] = createContext<T>();
	const get = (): T => (has() ? read() : fallback);
	return [get, set] as const;
}
