import { untrack } from 'svelte';

/**
 * Svelte proxies a plain object or array written to a `$bindable` prop, so the
 * value read back is not the one written. Values that select by reference
 * (an object radio value, an object tab value) need the written one back.
 * `current` returns the written reference while the prop still holds its echo.
 */
export class WrittenReference<T> {
	#written = $state.raw<{ value: T; echo: T } | null>(null);
	readonly #read: () => T;
	readonly #write: (next: T) => void;

	constructor(read: () => T, write: (next: T) => void) {
		this.#read = read;
		this.#write = write;
	}

	get current(): T {
		const value = this.#read();
		const written = this.#written;
		return written && Object.is(value, written.echo) ? written.value : value;
	}

	set(next: T) {
		const before = untrack(this.#read);
		this.#write(next);
		const echo = untrack(this.#read);
		// A `bind:value={get, set}` parent that rejects the write leaves the prop where it was.
		if (Object.is(echo, before) && !Object.is(next, before)) return;
		this.#written = { value: next, echo };
	}
}
