// A control that writes its named input itself fires the events a user edit of that input
// fires, so form-level `input` and `change` listeners see it like a native control.

let dispatching = false;
/** The input's state at its last `change`, kept from the first `input` after it. */
const stateAtChange = new WeakMap<HTMLInputElement, string>();

/** What a user edit changes: `checked` for a checkbox or radio, `value` otherwise. */
function editedState(input: HTMLInputElement) {
	return input.type === 'checkbox' || input.type === 'radio' ? String(input.checked) : input.value;
}

/**
 * Fires `type` from `input` once Svelte has written the control's new state. An `input`
 * event is dropped when the owner kept the previous state. A `change` event fires only
 * when the state differs from the one at the previous `change`, as it does natively.
 */
export function queueValueEvent(
	input: HTMLInputElement | null | undefined,
	type: 'input' | 'change'
) {
	if (!input) return;
	const previous = editedState(input);
	if (type === 'input' && !stateAtChange.has(input)) stateAtChange.set(input, previous);
	// Svelte flushes the write in a microtask queued before this one.
	queueMicrotask(() => {
		const next = editedState(input);
		const unchanged = next === (type === 'input' ? previous : (stateAtChange.get(input) ?? next));
		if (type === 'change') stateAtChange.delete(input);
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
