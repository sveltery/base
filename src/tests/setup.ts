import { beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import { cleanup } from 'vitest-browser-svelte';
import { parkPointer } from './pointer.js';

// Importing vitest-browser-svelte registers its cleanup hook ahead of this one. The explicit
// cleanup() keeps the previous test unmounted before the park even if that import changes.
beforeEach(async () => {
	cleanup();
	await parkPointer();
});

// React Testing Library wraps each user action in `act`, which renders the work it scheduled.
// A press schedules its open commit in a task after the next frame, as React does, and the click
// can resolve before that frame paints. So each action here waits one frame and then one task
// before the test reads the DOM. The real timers keep fake-timer specs moving.
const realRequestAnimationFrame = globalThis.requestAnimationFrame;
const realSetTimeout = globalThis.setTimeout;
for (const name of ['click', 'dblClick', 'tripleClick'] as const) {
	const action = userEvent[name] as (...args: unknown[]) => Promise<void>;
	userEvent[name] = async (...args: unknown[]) => {
		await action.apply(userEvent, args);
		await new Promise((resolve) => realRequestAnimationFrame(() => realSetTimeout(resolve)));
	};
}
