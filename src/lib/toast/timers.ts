// Derived from Base UI v1.9.0 packages/react/src/toast/store.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
// The store's auto-dismiss timers. They are not rendered, so they are plain `Timeout`s
// in a plain map. The store owns the instance and calls `dispose()` when its provider goes.

import { BROWSER } from 'esm-env';
import { Timeout } from '@sveltery/utils';

interface TimerInfo {
	timeout?: Timeout | undefined;
	/** Timestamp of the last time the timeout started running. */
	start: number;
	/** Full timeout duration, used to restart a timer that elapsed while throttled. */
	delay: number;
	/** Time left before the toast auto-dismisses, excluding any paused time. */
	remaining: number;
	callback: () => void;
}

export class ToastTimers {
	#timers = new Map<string, TimerInfo>();
	#paused = false;

	has(id: string) {
		return this.#timers.has(id);
	}

	/** Starts a timer, or records it paused when `startActive` is false. */
	schedule(id: string, delay: number, startActive: boolean, callback: () => void) {
		// The provider disposes the timers from an effect, which never runs on the server.
		if (!BROWSER) return;
		const start = Date.now();
		// eslint-disable-next-line sveltery/no-unscoped-timer -- ToastTimers owns it; dispose() clears it
		const timeout = startActive ? Timeout.create() : undefined;
		timeout?.start(delay, () => {
			this.#fired(id);
			callback();
		});
		this.#timers.set(id, { timeout, start, delay, remaining: delay, callback });
	}

	clear(id: string) {
		this.#timers.get(id)?.timeout?.clear();
		this.#timers.delete(id);
		this.#resetPausedStateIfNoTimersRemain();
	}

	clearAll() {
		this.dispose();
		this.#paused = false;
	}

	dispose() {
		this.#timers.forEach((timer) => timer.timeout?.clear());
		this.#timers.clear();
	}

	pause() {
		if (this.#paused) return;
		this.#paused = true;
		this.#timers.forEach((timer) => {
			// Timers added while already paused have no running timeout, so their
			// `remaining` is still the full delay and must be left alone.
			if (timer.timeout) {
				timer.timeout.clear();
				// `start` is stamped on every resume, so subtracting from `remaining`
				// (rather than from the original delay) keeps repeated pause/resume
				// cycles from handing the toast extra time.
				timer.remaining = Math.max(timer.remaining - (Date.now() - timer.start), 0);
			}
		});
	}

	resume() {
		if (!this.#paused) return;
		this.#paused = false;
		this.#timers.forEach((timer, id) => {
			timer.remaining = timer.remaining > 0 ? timer.remaining : timer.delay;
			// eslint-disable-next-line sveltery/no-unscoped-timer -- ToastTimers owns it; dispose() clears it
			timer.timeout ??= Timeout.create();
			timer.timeout.start(timer.remaining, () => {
				this.#fired(id);
				timer.callback();
			});
			timer.start = Date.now();
		});
	}

	#fired(id: string) {
		this.#timers.delete(id);
		this.#resetPausedStateIfNoTimersRemain();
	}

	#resetPausedStateIfNoTimersRemain() {
		// No timers remain to keep paused; clear the flag so a fresh toast's
		// running timer can be paused again on hover or focus.
		if (this.#timers.size === 0) this.#paused = false;
	}
}
