// Workaround for SvelteKit 3.0.1: after a user clicks a reset button, a remote form keeps the
// edited values in `fields.x.value()` while the inputs show their defaults. Kit re-reads FormData
// a `tick()` after the `reset` event, but for a user-activated reset the browser resets the
// inputs only after the listeners' microtasks, a task later. A programmatic `form.reset()` resets
// them before the microtasks and is not affected. Resetting once more a task later lets the
// source re-read the reset values. Delete this file once Kit reads the values a task later.

import { on } from 'svelte/events';
import { Timeout } from '@sveltery/utils';
import type { FormSource } from './source.js';

const ownResets = new WeakSet<HTMLFormElement>();

/** Whether `source` is a Kit remote form, which posts to `?/remote=<id>`. Only those need the replay. */
export function isRemoteForm(source: FormSource | undefined): boolean {
	return typeof source?.action === 'string' && new URLSearchParams(source.action).has('/remote');
}

/** Resets `form` without a replay. For resets that already happen after the inputs settle. */
export function resetForm(form: HTMLFormElement) {
	ownResets.add(form);
	try {
		HTMLFormElement.prototype.reset.call(form);
	} finally {
		ownResets.delete(form);
	}
}

/**
 * Replays each reset of `form` that was not canceled, once, a task later, while `enabled()`.
 * `isTrusted` is true for a button and for `form.reset()`, so both are replayed. Listeners on
 * the form see a second `reset` event.
 */
export function replayResets(form: HTMLFormElement, enabled: () => boolean) {
	// eslint-disable-next-line sveltery/no-unscoped-timer -- owned by the Form attachment, cleared on detach
	const timer = new Timeout();
	const stop = on(form, 'reset', (event) => {
		if (ownResets.has(form) || !enabled()) return;
		timer.start(0, () => {
			if (!event.defaultPrevented && form.isConnected) resetForm(form);
		});
	});
	return () => {
		stop();
		timer.clear();
	};
}
