// A native form reset, mirrored the way Svelte's `bind:value` and `bind:checked` mirror it:
// each control returns its bound value to its default once the browser has reset the inputs.

import { flushSync } from 'svelte';
import { on } from 'svelte/events';
import { Timeout } from '@sveltery/utils';

export interface ResetPhases {
	/** Writes the control's default value. */
	restore?: () => void;
	/** Runs after every restored value has flushed, for state that reads them. */
	settle?: () => void;
}

interface ResetListeners {
	phases: Set<ResetPhases>;
	stop: () => void;
}

const forms = new WeakMap<HTMLFormElement, ResetListeners>();

function listen(form: HTMLFormElement): ResetListeners {
	// eslint-disable-next-line sveltery/no-unscoped-timer -- one per form, cleared when its last control leaves
	const timer = new Timeout();
	let pending: Event[] = [];
	const phases = new Set<ResetPhases>();
	const stopListening = on(form, 'reset', (event) => {
		pending.push(event);
		// After a reset button, the browser resets the inputs once the listeners' microtasks
		// have run, so the values are only reset a task later.
		timer.start(0, () => {
			const events = pending;
			pending = [];
			if (events.every((item) => item.defaultPrevented)) return;
			for (const entry of [...phases]) entry.restore?.();
			flushSync();
			for (const entry of [...phases]) entry.settle?.();
		});
	});
	const listeners: ResetListeners = {
		phases,
		stop: () => {
			stopListening();
			timer.clear();
		}
	};
	forms.set(form, listeners);
	return listeners;
}

/** Runs `phases` after each reset of `form` that was not canceled. */
export function onFormReset(form: HTMLFormElement, phases: ResetPhases): () => void {
	const listeners = forms.get(form) ?? listen(form);
	listeners.phases.add(phases);
	return () => {
		listeners.phases.delete(phases);
		if (listeners.phases.size > 0) return;
		listeners.stop();
		forms.delete(form);
	};
}

/** A form itself, the form an input submits with, or the form around any other element. */
export function ownerForm(element: Element | null | undefined): HTMLFormElement | null {
	if (!element) return null;
	if (element instanceof HTMLFormElement) return element;
	if ('form' in element) return element.form instanceof HTMLFormElement ? element.form : null;
	return element.closest('form');
}

/**
 * Runs `phases` after the form that owns `element` resets. Pass the control's named input
 * so a `form` attribute is honored. Call during component init.
 * `restore` writes the control's default through its normal value path and does not
 * call change callbacks, because a native reset fires no `input` or `change` event.
 */
export function restoreOnReset(element: () => Element | null | undefined, phases: ResetPhases) {
	$effect(() => {
		const form = ownerForm(element());
		if (!form) return;
		return onFormReset(form, phases);
	});
}
