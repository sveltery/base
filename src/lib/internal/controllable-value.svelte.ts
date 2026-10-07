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
	let stored = $state.raw<T | undefined>(
		untrack(() => {
			const prop = options.getProp();
			return prop !== undefined ? prop : options.getDefault();
		})
	);
	let echoed = $state.raw<T | undefined>(untrack(() => options.getProp()));
	let adopted = false;
	let opened = true;
	let notifyFromWrite = false;

	const value = $derived.by(() => {
		const prop = options.getProp();
		if (Object.is(prop, echoed)) return stored;
		if (!controlled && prop === undefined && !adopted) return stored;
		return prop;
	});

	$effect(() => {
		const next = value;
		if (opened) {
			opened = false;
			return;
		}
		if (notifyFromWrite) {
			notifyFromWrite = false;
			return;
		}
		untrack(() => options.onChange?.(next));
	});

	return {
		get value() {
			return value;
		},
		get controlled() {
			return controlled;
		},
		set(next) {
			const changed = !Object.is(
				untrack(() => value),
				next
			);
			if (changed) notifyFromWrite = true;
			stored = next;
			echoed = next;
			const prop = untrack(() => options.getProp());
			if (controlled || prop !== undefined) {
				adopted = true;
				options.setProp(next);
			}
			if (changed) options.onChange?.(next);
		}
	};
}
