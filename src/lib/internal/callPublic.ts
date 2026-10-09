import { untrack } from 'svelte';

/**
 * Invoke a consumer callback outside effect tracking.
 * The callback can write `$state` without re-running the caller.
 */
export function callPublic<Args extends unknown[]>(
	fn: ((...args: Args) => void) | undefined,
	...args: Args
): void {
	if (fn === undefined) return;
	untrack(() => {
		fn(...args);
	});
}
