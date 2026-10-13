// Derived from Base UI v1.9.0 packages/react/src/internals/useValueChanged.ts
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.

import { untrack } from 'svelte';

/**
 * Runs `onChange` after the DOM update whenever `read()` changes, whether a
 * handler or the parent wrote it. The first value does not count. The effect
 * re-runs only when what `read()` depends on changes, so `read` should return
 * a `$derived` or a prop.
 */
export function useValueChanged<T>(read: () => T, onChange: (next: T) => void) {
	let mounted = false;
	$effect(() => {
		const next = read();
		if (!mounted) {
			mounted = true;
			return;
		}
		untrack(() => onChange(next));
	});
}
