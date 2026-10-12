// A control that writes its named input itself fires the events a user edit of that input
// fires, so form-level `input` and `change` listeners see it like a native control.

let dispatching = false;
/** The input's value at its last `change`, kept from the first `input` after it. */
const valueAtChange = new WeakMap<HTMLInputElement, string>();

/**
 * Fires `type` from `input` once Svelte has written the control's new value. An `input`
 * event is dropped when the owner kept the previous value. A `change` event fires only
 * when the value differs from the one at the previous `change`, as it does natively.
 */
export function queueValueEvent(
	input: HTMLInputElement | null | undefined,
	type: 'input' | 'change'
) {
	if (!input) return;
	const previous = input.value;
	if (type === 'input' && !valueAtChange.has(input)) valueAtChange.set(input, previous);
	// Svelte flushes the write in a microtask queued before this one.
	queueMicrotask(() => {
		const unchanged =
			input.value === (type === 'input' ? previous : (valueAtChange.get(input) ?? input.value));
		if (type === 'change') valueAtChange.delete(input);
		if (!input.isConnected || unchanged) return;
		dispatching = true;
		try {
			input.dispatchEvent(new Event(type, { bubbles: true }));
		} finally {
			dispatching = false;
		}
	});
}

/** True while `queueValueEvent` dispatches. The control's own listeners skip that event. */
export function dispatchingValueEvent() {
	return dispatching;
}
