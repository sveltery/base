// Derived from Base UI v1.8.0 packages/utils/src/useControlled.ts
// and packages/react/src/internals/useValueChanged.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';

export interface ControllableValue<T> {
	readonly value: T | undefined;
	readonly controlled: boolean;
	set(next: T | undefined): void;
}

export function createControllableValue<T>(options: {
	getProp: () => T | undefined;
	setProp: (next: T | undefined) => void;
	getDefault: () => T;
	onChange?: (next: T | undefined) => void;
}): ControllableValue<T> {
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

	function publish(next: T | undefined) {
		if (Object.is(next, lastNotified)) return;
		lastNotified = next;
		options.onChange?.(next);
	}

	const value = $derived.by(() => {
		const prop = options.getProp();
		if (controlled && prop === undefined) return fallback;
		if (Object.is(prop, echoed)) return stored;
		if (!controlled && prop === undefined && !adopted) return stored;
		if (prop === undefined) return fallback;
		return prop;
	});

	$effect(() => {
		const next = value;
		untrack(() => publish(next));
	});

	return {
		get value() {
			return value;
		},
		get controlled() {
			return controlled;
		},
		set(next) {
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
			publish(untrack(() => value));
		}
	};
}

function parentHoldsWritten(after: unknown, next: unknown) {
	if (Object.is(after, next)) return true;
	if (!isObject(after) || !isObject(next)) return false;
	// A $state proxy rejects a non-writable descriptor before it stores anything.
	// Plain objects accept the mark, which is how a proxied read-back is recognized.
	if (isStateProxy(next) || !isPlainObject(next)) return false;
	const mark = Symbol();
	try {
		Object.defineProperty(next, mark, { configurable: true, writable: true, value: true });
		return (after as Record<symbol, boolean>)[mark] === true;
	} catch {
		return false;
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

function isStateProxy(value: object) {
	const mark = Symbol();
	try {
		Object.defineProperty(value, mark, {
			configurable: false,
			enumerable: false,
			writable: false,
			value: true
		});
	} catch {
		return true;
	}
	Reflect.deleteProperty(value, mark);
	return false;
}
