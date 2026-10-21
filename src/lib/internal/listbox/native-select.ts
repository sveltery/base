// The hidden `<select>` that submits a select's value. No Base UI equivalent: upstream renders
// hidden inputs. A select stays in the form when no value is selected, so a form library
// listening on the form still hears the edit that cleared it.
// Shared by Select and Combobox.

import { dispatchValueEvent } from '../value-events.js';

/** Whether two lists hold the same strings in the same order. */
export function sameStrings(a: readonly unknown[], b: readonly unknown[]) {
	return a.length === b.length && a.every((item, index) => Object.is(item, b[index]));
}

function selected(select: HTMLSelectElement) {
	return Array.from(select.selectedOptions, (option) => option.value);
}

/**
 * Fires `input` and `change` from the select once Svelte has written the new options, as a
 * user edit of a native `<select>` does. Nothing fires when the owner kept the value.
 */
export function queueSelectEvents(select: HTMLSelectElement | null) {
	if (!select) return;
	const previous = selected(select);
	// Svelte flushes the write in a microtask queued before this one.
	queueMicrotask(() => {
		if (!select.isConnected || sameStrings(selected(select), previous)) return;
		dispatchValueEvent(select, 'input');
		dispatchValueEvent(select, 'change');
	});
}

export interface NativeOption {
	value: string;
	label: string;
	/** The item value the option stands for. */
	source: unknown;
}

/**
 * One option per serialized value, in first-seen order. An empty value is left out: a single
 * select renders its own empty option for it.
 */
export function nativeOptions(
	candidates: Iterable<unknown>,
	serialize: (item: unknown) => string,
	label: (item: unknown) => string
): NativeOption[] {
	const options = new Map<string, NativeOption>();
	for (const candidate of candidates) {
		const value = serialize(candidate);
		if (value === '' || options.has(value)) continue;
		options.set(value, { value, label: label(candidate) || value, source: candidate });
	}
	return [...options.values()];
}
