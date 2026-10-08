// Derived from Base UI v1.8.0 packages/utils/src/useControlled.ts
// and packages/react/src/internals/useValueChanged.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';

export interface ControllableValue<T, Details = unknown> {
	readonly value: T | undefined;
	readonly controlled: boolean;
	set(next: T | undefined, details?: Details): void;
	/**
	 * Run the change notice for the current value, including a same-value commit.
	 * The notice waits until the input has updated, as a notice from `set` does.
	 * A later migration can announce Accordion, Checkbox, CheckboxGroup, Collapsible,
	 * Switch, Toggle, and ToggleGroup through this same notice.
	 */
	notify(details?: Details): void;
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
	let forceNotice = false;
	let pendingDetails: Details | undefined;
	let detailsPending = false;
	// Bumps so a same-value notice still runs in the effect, after the DOM commit.
	let noticeVersion = $state(0);
	let seenVersion = -1;

	function publish(next: T | undefined, version: number) {
		if (version < seenVersion) return;
		seenVersion = version;
		const forced = forceNotice;
		forceNotice = false;
		const details = detailsPending ? pendingDetails : undefined;
		detailsPending = false;
		pendingDetails = undefined;
		if (!forced && Object.is(next, lastNotified)) return;
		lastNotified = next;
		options.onChange?.(next, details);
	}

	const value = $derived.by(() => {
		const prop = options.getProp();
		if (controlled && prop === undefined) return fallback;
		if (Object.is(prop, echoed)) return stored;
		if (!controlled && prop === undefined && !adopted) return stored;
		if (prop === undefined) return fallback;
		return prop;
	});

	// After the DOM commit, for parent writes, `set`, and `notify`. `$effect.pre`
	// still reads the previous input value, and publishing inside `set` does too.
	$effect(() => {
		const version = noticeVersion;
		const next = value;
		untrack(() => publish(next, version));
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
			pendingDetails = details;
			detailsPending = details !== undefined;
			// The derived value did not change, so the effect would not run. Schedule
			// it when this write still carries event details.
			if (
				detailsPending &&
				Object.is(
					untrack(() => value),
					lastNotified
				)
			) {
				forceNotice = true;
				noticeVersion += 1;
			}
		},
		notify(details) {
			pendingDetails = details;
			detailsPending = details !== undefined;
			forceNotice = true;
			noticeVersion += 1;
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
