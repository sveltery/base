// Derived from Base UI v1.8.0 packages/utils/src/useTimeout.ts (`Timeout`),
// packages/utils/src/useAnimationFrame.ts (`AnimationFrame`), and
// packages/react/src/internals/TimeoutManager.ts
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.
// `useTimeout` and `useAnimationFrame` live in `timeout.svelte.ts` (`$effect` cleanup).
// `DEV` replaces `process.env.NODE_ENV`.

import { DEV } from 'esm-env';

const EMPTY_FRAME = null;

let lastAnimationFrame = globalThis.requestAnimationFrame;

class Scheduler {
	callbacks: Array<((timestamp: number) => void) | null> = [];
	callbacksCount = 0;
	nextId = 1;
	startId = 1;
	isScheduled = false;

	tick = (timestamp: number) => {
		this.isScheduled = false;
		const currentCallbacks = this.callbacks;
		const currentCallbacksCount = this.callbacksCount;

		this.callbacks = [];
		this.callbacksCount = 0;
		this.startId = this.nextId;
		if (currentCallbacksCount > 0) {
			for (let i = 0; i < currentCallbacks.length; i += 1) {
				currentCallbacks[i]?.(timestamp);
			}
		}
	};

	request(fn: (timestamp: number) => void) {
		const id = this.nextId;
		this.nextId += 1;
		this.callbacks.push(fn);
		this.callbacksCount += 1;

		const requestFrame = globalThis.requestAnimationFrame;
		const didFrameChange =
			DEV && lastAnimationFrame !== requestFrame && ((lastAnimationFrame = requestFrame), true);
		if (!this.isScheduled || didFrameChange) {
			requestFrame(this.tick);
			this.isScheduled = true;
		}
		return id;
	}

	cancel(id: number) {
		const index = id - this.startId;
		if (index < 0 || index >= this.callbacks.length) return;
		if (this.callbacks[index] === null) return;
		this.callbacks[index] = null;
		this.callbacksCount -= 1;
	}
}

let scheduler = new Scheduler();

/** Drops pending animation-frame callbacks. For tests that replace `requestAnimationFrame`. */
export function resetAnimationFrameScheduler() {
	const previous = scheduler;
	scheduler = new Scheduler();
	scheduler.nextId = previous.nextId;
	scheduler.startId = previous.nextId;
	previous.callbacks = [];
	previous.callbacksCount = 0;
}

export class AnimationFrame {
	static create() {
		return new AnimationFrame();
	}

	static request(fn: (timestamp: number) => void) {
		return scheduler.request(fn);
	}

	static cancel(id: number) {
		scheduler.cancel(id);
	}

	currentId: number | null = EMPTY_FRAME;

	request(fn: () => void) {
		this.cancel();
		this.currentId = scheduler.request(() => {
			this.currentId = EMPTY_FRAME;
			fn();
		});
	}

	cancel = () => {
		if (this.currentId !== EMPTY_FRAME) {
			scheduler.cancel(this.currentId);
			this.currentId = EMPTY_FRAME;
		}
	};
}

type TimeoutId = ReturnType<typeof setTimeout>;

export class Timeout {
	static create() {
		return new Timeout();
	}

	currentId: TimeoutId | null = null;

	start(delay: number, fn: () => void) {
		this.clear();
		this.currentId = setTimeout(() => {
			this.currentId = null;
			fn();
		}, delay);
	}

	isStarted() {
		return this.currentId !== null;
	}

	clear = () => {
		if (this.currentId !== null) {
			clearTimeout(this.currentId);
			this.currentId = null;
		}
	};
}

/** Several named timeouts. Starting a key replaces the previous timer for that key. */
export class TimeoutManager {
	private ids = new Map<string, TimeoutId>();

	start(key: string, delay: number, fn: () => void) {
		this.clear(key);
		const id = setTimeout(() => {
			this.ids.delete(key);
			fn();
		}, delay);
		this.ids.set(key, id);
	}

	clear(key: string) {
		const id = this.ids.get(key);
		if (id != null) {
			clearTimeout(id);
			this.ids.delete(key);
		}
	}

	clearAll() {
		for (const id of this.ids.values()) clearTimeout(id);
		this.ids.clear();
	}
}
