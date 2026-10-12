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
		this.#write(next);
		const echo = untrack(this.#read);
		// A `bind:value={get, set}` parent can keep or replace the value instead.
		this.#written = isProxyOf(echo, next) ? { value: next, echo } : null;
	}
}

function isProxyOf(echo: unknown, written: unknown) {
	if (Object.is(echo, written) || !isObject(echo) || !isObject(written)) return false;
	const mark = Symbol();
	try {
		// A `$state` proxy rejects a non-writable descriptor, so the mark goes on the
		// written object and is read back through the proxy that wraps it.
		Object.defineProperty(written, mark, { configurable: true, writable: false, value: true });
	} catch {
		return false;
	}
	try {
		return (echo as Record<symbol, unknown>)[mark] === true;
	} finally {
		Reflect.deleteProperty(written, mark);
	}
}

function isObject(value: unknown): value is object {
	return value != null && typeof value === 'object';
}
