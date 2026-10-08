// Derived from Base UI v1.8.0 packages/utils/src/useControlled.ts
// and packages/react/src/internals/useValueChanged.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';

export interface ControllableValue<T, Details = unknown> {
	readonly value: T | undefined;
	readonly controlled: boolean;
	/**
	 * Store `next`. When that write is still the value after the DOM update, the
	 * change notice receives `details` with it. A write that leaves the value
	 * unchanged does not notify, including a round trip back to the current value.
	 */
	set(next: T | undefined, details?: Details): void;
	/**
	 * Notify for the current value after the DOM update, even when it did not change.
	 */
	announce(details?: Details): void;
}

export function createControllableValue<T, Details = unknown>(options: {
	getProp: () => T | undefined;
	setProp: (next: T | undefined) => void;
	getDefault: () => T;
	onChange?: (next: T | undefined, details?: Details) => void;
}): ControllableValue<T, Details> {
	const controlled = untrack(() => options.getProp() !== undefined);
	const fallback = untrack(() => options.getDefault());
	const initial = untrack(() => {
		const prop = options.getProp();
		return prop !== undefined ? prop : fallback;
	});
	let stored = $state.raw<T | undefined>(initial);
	let echoed = $state.raw<T | undefined>(untrack(() => options.getProp()));
	let adopted = false;
	let lastNotified: T | undefined = initial;
	// The value a write or `announce` produced, and the details that belong to it.
	// A later call replaces both, so one notice cannot take another's details.
	let pending = $state.raw<{
		value: T | undefined;
		details?: Details;
		announce?: boolean;
	} | null>(null);

	function publish(
		next: T | undefined,
		queued: { value: T | undefined; details?: Details; announce?: boolean } | null
	) {
		if (queued !== null && pending === queued) pending = null;
		const matches = queued != null && Object.is(queued.value, next);
		if (Object.is(next, lastNotified) && !(matches && queued?.announce)) return;
		lastNotified = next;
		options.onChange?.(next, matches ? queued?.details : undefined);
	}

	const value = $derived.by(() => {
		const prop = options.getProp();
		if (controlled && prop === undefined) return fallback;
		if (Object.is(prop, echoed)) return stored;
		if (!controlled && prop === undefined && !adopted) return stored;
		if (prop === undefined) return fallback;
		return prop;
	});

	// After the DOM commit, for parent writes and `set`. `$effect.pre` still reads
	// the previous input value, and publishing inside `set` does too.
	$effect(() => {
		const next = value;
		const queued = pending;
		untrack(() => publish(next, queued));
	});

	return {
		get value() {
			return value;
		},
		get controlled() {
			return controlled;
		},
		set(next, details) {
			adopted = true;
			options.setProp(next);
			const after = untrack(() => options.getProp());
			// A $state prop proxies objects. Keep the written object when the parent
			// still holds it. A primitive, a rejected write, or a normalized value is
			// whatever the parent has now.
			if (parentHoldsWritten(after, next)) {
				stored = next;
				echoed = after;
			} else {
				stored = after;
				echoed = after;
			}
			const settled = untrack(() => value);
			// Upstream `useValueChanged` skips a value that did not change, including
			// a round trip that is back where it started before the notice runs.
			if (Object.is(settled, lastNotified)) {
				pending = null;
				return;
			}
			pending = { value: settled, details };
		},
		announce(details) {
			pending = { value: untrack(() => value), details, announce: true };
		}
	};
}

function parentHoldsWritten(after: unknown, next: unknown) {
	if (Object.is(after, next)) return true;
	if (!isObject(after) || !isObject(next) || !isPlainObject(next)) return false;
	const mark = Symbol();
	try {
		// A $state proxy rejects a non-writable descriptor before it stores anything.
		// Plain objects accept the mark, which is how a proxied read-back is recognized.
		Object.defineProperty(next, mark, { configurable: true, writable: false, value: true });
	} catch {
		return false;
	}
	try {
		return (after as Record<symbol, boolean>)[mark] === true;
	} finally {
		Reflect.deleteProperty(next, mark);
	}
}

function isObject(value: unknown): value is object {
	return value != null && typeof value === 'object';
}

function isPlainObject(value: object) {
	if (Array.isArray(value)) return false;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}
