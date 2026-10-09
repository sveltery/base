import { untrack } from 'svelte';

export function callPublic<Args extends unknown[]>(
	fn: ((...args: Args) => void) | undefined,
	...args: Args
) {
	return untrack(() => fn?.(...args));
}
