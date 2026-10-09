/** A `Map` that is not reactive state. `SvelteMap` would subscribe the caller. */
export function plainMap<K, V>(entries?: Iterable<readonly [K, V]>) {
	return new Map(entries);
}
