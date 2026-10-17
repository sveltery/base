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
// A press can schedule its open commit in a task after the next frame, as React does, so each
// action here waits one task before the test reads the DOM. The real timer keeps fake-timer specs moving.
const realSetTimeout = globalThis.setTimeout;
for (const name of ['click', 'dblClick', 'tripleClick'] as const) {
	const action = userEvent[name] as (...args: unknown[]) => Promise<void>;
	userEvent[name] = async (...args: unknown[]) => {
		await action.apply(userEvent, args);
		await new Promise((resolve) => realSetTimeout(resolve));
	};
}
