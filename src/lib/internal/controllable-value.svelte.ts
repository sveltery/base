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
	let uncontrolled = $state.raw(untrack(() => options.getDefault()));
	let opened = true;
	let notifyFromWrite = false;

	const value = $derived.by(() => {
		const prop = options.getProp();
		if (!controlled) return uncontrolled;
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
			notifyFromWrite = true;
			if (controlled) options.setProp(next);
			else uncontrolled = next as T;
			options.onChange?.(next);
		}
	};
}
