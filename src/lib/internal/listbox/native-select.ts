// The hidden `<select multiple>` that submits a multiple select's values. No Base UI
// equivalent: upstream renders one hidden input per value. A select stays in the form when no
// value is selected, so a form library listening on the form still hears the edit that cleared it.
// Shared by Select and Combobox.

/** Whether two lists hold the same strings in the same order. */
export function sameStrings(a: readonly unknown[], b: readonly unknown[]) {
	return a.length === b.length && a.every((item, index) => Object.is(item, b[index]));
}

function selected(select: HTMLSelectElement) {
	return Array.from(select.selectedOptions, (option) => option.value);
}

/**
 * Fires `input` and `change` from the select once Svelte has written the new options, as a
 * user edit of a native `<select multiple>` does. Nothing fires when the owner kept the value.
 */
export function queueSelectEvents(select: HTMLSelectElement | null) {
	if (!select) return;
	const previous = selected(select);
	// Svelte flushes the write in a microtask queued before this one.
	queueMicrotask(() => {
		if (!select.isConnected || sameStrings(selected(select), previous)) return;
		select.dispatchEvent(new Event('input', { bubbles: true }));
		select.dispatchEvent(new Event('change', { bubbles: true }));
	});
}
