import { beforeEach } from 'vitest';
import { cleanup } from 'vitest-browser-svelte';
import { parkPointer } from './pointer.js';

// vitest-browser-svelte unmounts the previous test's components in its own beforeEach, which
// runs after this one. Unmount first so the pointer does not leave through them.
beforeEach(async () => {
	cleanup();
	await parkPointer();
});
