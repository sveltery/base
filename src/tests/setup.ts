import { beforeEach } from 'vitest';
import { cleanup } from 'vitest-browser-svelte';
import { parkPointer } from './pointer.js';

// Importing vitest-browser-svelte registers its cleanup hook ahead of this one. The explicit
// cleanup() keeps the previous test unmounted before the park even if that import changes.
beforeEach(async () => {
	cleanup();
	await parkPointer();
});
