// A native form reset, mirrored the way Svelte's `bind:value` and `bind:checked` mirror it:
// each control returns its bound value to its default once the browser has reset the inputs.

import { flushSync } from 'svelte';
import { on } from 'svelte/events';
import { Timeout } from '@sveltery/utils';

interface ResetListeners {
	/** Controls write their default values. */
	restore: Set<() => void>;
	/** Runs after the restored values have flushed, for state that reads them. */
	settle: Set<() => void>;
	stop: () => void;
}

const forms = new WeakMap<HTMLFormElement, ResetListeners>();

function listen(form: HTMLFormElement): ResetListeners {
	// eslint-disable-next-line sveltery/no-unscoped-timer -- one per form, cleared when its last control leaves
	const timer = new Timeout();
	let pending: Event[] = [];
	const listeners: ResetListeners = { restore: new Set(), settle: new Set(), stop: () => {} };
	const stopListening = on(form, 'reset', (event) => {
		pending.push(event);
		// After a reset button, the browser resets the inputs once the listeners' microtasks
		// have run, so the values are only reset a task later.
		timer.start(0, () => {
			const events = pending;
			pending = [];
			if (events.every((item) => item.defaultPrevented)) return;
			for (const restore of [...listeners.restore]) restore();
			flushSync();
			for (const settle of [...listeners.settle]) settle();
		});
	});
	listeners.stop = () => {
		stopListening();
		timer.clear();
	};
	forms.set(form, listeners);
	return listeners;
}

/** Runs `callback` in `phase` after each reset of `form` that was not canceled. */
export function onFormReset(
	form: HTMLFormElement,
	phase: 'restore' | 'settle',
	callback: () => void
): () => void {
	const listeners = forms.get(form) ?? listen(form);
	listeners[phase].add(callback);
	return () => {
		listeners[phase].delete(callback);
		if (listeners.restore.size > 0 || listeners.settle.size > 0) return;
		listeners.stop();
		forms.delete(form);
	};
}

/** The form an input submits with, or the form around any other element. */
export function ownerForm(element: Element | null | undefined): HTMLFormElement | null {
	if (!element) return null;
	if ('form' in element) return element.form instanceof HTMLFormElement ? element.form : null;
	return element.closest('form');
}

/**
 * Calls `restore` after the form that owns `element` resets. Call during component init.
 * `restore` writes the control's default through its normal value path and does not
 * call change callbacks, because a native reset fires no `input` or `change` event.
 */
export function restoreOnReset(
	element: () => Element | null | undefined,
	restore: () => void,
	phase: 'restore' | 'settle' = 'restore'
) {
	$effect(() => {
		const form = ownerForm(element());
		if (!form) return;
		return onFormReset(form, phase, restore);
	});
}
