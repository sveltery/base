// A control that writes its named input itself fires the events a user edit of that input
// fires, so form-level `input` and `change` listeners see it like a native control.

const dispatched = new WeakSet<Event>();

/**
 * Fires `type` from `input` once Svelte has written the control's new value. An `input`
 * event is dropped when the owner kept the previous value.
 */
export function queueValueEvent(
	input: HTMLInputElement | null | undefined,
	type: 'input' | 'change'
) {
	if (!input) return;
	const previous = type === 'input' ? input.value : undefined;
	// Svelte flushes the write in a microtask queued before this one.
	queueMicrotask(() => {
		if (!input.isConnected || (previous !== undefined && input.value === previous)) return;
		const event = new Event(type, { bubbles: true });
		dispatched.add(event);
		input.dispatchEvent(event);
	});
}

/** True for an event `queueValueEvent` fired. The control's own listeners skip it. */
export function isQueuedValueEvent(event: Event) {
	return dispatched.has(event);
}
